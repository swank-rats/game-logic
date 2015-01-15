'use strict';

/**
 * Module dependencies.
 */

// TODO split code into multiple files and refactor
// TODO check reset of values after game!!!
// TODO timeout sockets?
// TODO refactor update function
// TODO set current game via req.game
// TODO do not set user object directly in player - reference and populate afterwards if needed

var mean = require('meanio'),
    config = mean.loadConfig(),
    mongoose = require('mongoose'),
    Util = require('util'),
    Game = mongoose.model('Game'),
    GameStatus = {
        ended: 'ended',         // game is finished
        started: 'started',     // game has started
        ready: 'ready',         // both players joined the game
        waiting: 'waiting'      // one player created a game and is waiting for the second
    },

    ClientSockets = {},
    CurrentGame = {},
    ClientRobotAssigment = {},

// FIXME: just for development
    ImageServerSocket = {
        send: function(msg) {
            console.log('------- Image-Server:' + msg);
        }
    },
    RobotsSockets = {
        'pentagon': {
            send: function(msg) {
                console.log('##### Pentagon-Robot:' + msg);
            }
        },
        'square': {
            send: function(msg) {
                console.log('##### Square-Robot:' + msg);
            }
        }
    },

    /**
     * Sends a message through the websocket
     * @param to
     * @param cmd
     * @param params
     * @param data
     */
    getJSONMessage = function(to, cmd, params, data) {
        return JSON.stringify({
            to: to,
            cmd: cmd,
            params: params || {},
            data: data || {}
        });
    },

    /**
     * Merges the new player list with the existing one on the game
     * @param players
     * @param game
     */
    mergePlayers = function(players, game) {
        //FIXME could be reduced to one loop when the request is refactored
        players.forEach(function(newPlayer) {
            var duplicate = false;
            game.players.forEach(function(player) {
                if (newPlayer.form === player.form || newPlayer.user._id === player.user._id) {
                    duplicate = true;
                    return false;
                }
            }, this);

            if (!duplicate && !!newPlayer.user && !!newPlayer.user._id) {
                newPlayer.lifePoints = config.swankRats.players.lifePoints;
                game.players.push(newPlayer);
            }
            duplicate = false;
        }, this);
    },

    /**
     * Sets a connection between a client and a robot with username and form
     * @param user
     * @param form
     */
    setRobotSocketForUser = function(user, form) {
        if (!!RobotsSockets[form]) {
            ClientRobotAssigment[user] = form;
        } else {
            throw new Error('Robot with form ' + form + ' not found!');
        }
    },

    getRobotSocketForUser = function(user){
        return RobotsSockets[ClientRobotAssigment[user]];
    },

    /**
     * Sends a custom message to all clients
     * @param data
     */
    sendMessageToAllClients = function(data) {
        if (!!ClientSockets) {
            var message = JSON.stringify(data);
            for (var socket in ClientSockets) {
                ClientSockets[socket].send(message);
            }
        }
    },

    /**
     * Sends a message to all robots
     * @param to
     * @param cmd
     * @param params
     * @param data
     */
    sendMessageToAllRobots = function(to, cmd, params, data) {
        if (!!RobotsSockets) {
            params = !!params ? params : {};
            data = !!data ? data : {};
            var message = getJSONMessage(to, cmd, params, data);
            for (var socket in RobotsSockets) {
                RobotsSockets[socket].send(message);
            }
        }
    },

    /**
     * Sends a message to the image server
     * @param to
     * @param cmd
     * @param params
     * @param data
     */
    sendMessageToImageServer = function(to, cmd, params, data) {
        if (!!ImageServerSocket && !!to && !!cmd) {
            params = !!params ? params : {};
            data = !!data ? data : {};
            ImageServerSocket.send(getJSONMessage(to, cmd, params, data));
        } else {
            throw new Error('ImageServer not initialized!');
        }
    },

    /**
     * Creates a new game
     * @param user
     * @param form
     * @param res
     */
    createNewGame = function(user, form, res) {
        var game = new Game({
            status: GameStatus.waiting,
            players: [
                {
                    user: user,
                    form: form,
                    lifePoints: config.swankRats.players.lifePoints
                }
            ]
        });

        ClientSockets = {};
        ClientRobotAssigment = [];

        game.save(function(err) {
            if (err) {
                return res.json(500, {
                    error: 'Cannot create the game'
                });
            }
            res.json(game);
        });
    },

    /**
     * Returns winner of a game
     * @param game
     * @return {*}
     */
    getWinnerOfAGame = function(game){
        var winner = null;
        game.players.forEach(function(p) {
            if (p.lifePoints > 0) {
                winner = p;
                return false;
            }
        });

        if(!winner){
            throw new Error('No winner found!');
        }
        return winner;
    },

// TODO refactor method
    /**
     * Updates the state of a game and informs all parties of the changes
     * Does not propagate the changes to the database!
     * @param game
     * @param players
     */
    updateGame = function(game, players) {
        var maxPlayers = config.swankRats.players.max;

        switch (game.status) {
            case GameStatus.ended:
                return new Error('A game can not be changed when it is already finished!');
            case GameStatus.started: // end game
                    var winner = getWinnerOfAGame(CurrentGame);
                    game.status = GameStatus.ended;
                    game.ended = Date.now();
                    game.winner = winner.user._id;
                    sendMessageToImageServer('server', 'stop');
                    sendMessageToAllRobots('server', 'stop');
                    sendMessageToAllClients({
                        cmd: 'changedStatus',
                        status: GameStatus.ended,
                        winner: winner.user.username
                    });
                    ClientRobotAssigment = [];
                    ClientSockets = {};
                    // TODO calculate highscore etc
                break;
            case GameStatus.ready: // start game
                if (game.players.length === maxPlayers) {
                    game.status = GameStatus.started;
                    game.started = Date.now();
                    CurrentGame = game;
                    sendMessageToImageServer('server', 'start');
                    sendMessageToAllRobots('server', 'start');
                    sendMessageToAllClients({
                        cmd: 'changedStatus',
                        status: GameStatus.started
                    });
                } else {
                    return new Error('Max number of players reached!');
                }
                break;
            case GameStatus.waiting: // update players
                if (!!players && Util.isArray(players)) {
                    if (!!game.players && game.players.length < maxPlayers && players.length <= maxPlayers) {
                        mergePlayers(players, game);
                        // update state when max number of players is reached
                        if (game.players.length === maxPlayers) {
                            game.status = GameStatus.ready;
                            sendMessageToAllClients({
                                cmd: 'changedStatus',
                                status: GameStatus.ready
                            });
                        }
                    } else {
                        return new Error('Max number of players reached!');
                    }
                }
                break;
        }
    },

    /**
     * Searches for a player with the given form
     * @param form
     * @return {*}
     */
    getPlayerIndexForForm = function(form) {
        var index = -1,
            i = 0,
            length = CurrentGame.players.length;

        while (i < length) {
            if (CurrentGame.players[i].form === form) {
                index = i;
                break;
            }
            i += 1;
        }
        if (index < 0) {
            throw new Error('No player for this form ' + form + ' found!');
        }
        return index;
    },

    /**
     * Processes the hit of a player
     * @param playerForm
     * @param precision
     * @param points
     */
    playerGotHit = function(playerForm, precision, points) {
        var index = getPlayerIndexForForm(playerForm),
            hitValue = precision * points,
            changedPlayer = CurrentGame.players[index];

        // end of game
        if (CurrentGame.players[index].lifePoints <= hitValue) {
            changedPlayer.lifePoints = 0;
        } else {
            changedPlayer.lifePoints -= hitValue;
        }

        CurrentGame.players.set(index, changedPlayer);
        ClientSockets[changedPlayer.user.username].send(
            getJSONMessage(
                'server',
                'hit',
                {
                    username: changedPlayer.user.username,
                    lifePoints: changedPlayer.lifePoints
                }
            )
        );
        // end the game
        if (changedPlayer.lifePoints === 0) {
            updateGame(CurrentGame);
        }
    };
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Returns websocket listeners for client-websockets
 * @return {*}
 */
exports.getClientListener = function() {
    return {
        init: function(socket, params) {
            if (!!params.user) {
                ClientSockets[params.user] = socket;
                setRobotSocketForUser(params.user, params.form);
                // FIXME: just for development
                socket.send(params.user + ' initialized the websocket connection!');
                console.log(params.user + ' initialized the websocket connection!');
            }
        },
        move: function(socket, params) {
            if (!!params.user && CurrentGame.status === GameStatus.started && !!params.cmd) {
                if (!!params.started) {
                    getRobotSocketForUser(params.user).send(
                        getJSONMessage(
                            'robot',
                            params.cmd,
                            {started: params.started, user: params.user}
                        ));
                    // FIXME: just for development
                    socket.send(params.user + ' started moving: ' + params.cmd);
                } else {
                    getRobotSocketForUser(params.user).send(
                        getJSONMessage(
                            'robot',
                            params.cmd,
                            {started: params.started, user: params.user}
                        ));
                    // FIXME: just for development
                    socket.send(params.user + ' stopped moving: ' + params.cmd);
                }
            }
        },
        shoot: function(socket, params) {
            if (!!params.form && CurrentGame.status === GameStatus.started) {
                ImageServerSocket.send(getJSONMessage('server', 'shot', {form: params.form}));
                // FIXME: just for development
                socket.send('player shot!');

            }
        }
    };
};

/**
 * Returns listeners for image server
 * @return {}
 */
exports.getImageServerListener = function() {
    return {
        init: function(socket) {
            ImageServerSocket = socket;
            // FIXME: just for development
            console.log('Imageserver established the websocket connection!');
        },
        hit: function(socket, params) {
            if (!!params.form && !!params.precision) {
                playerGotHit(params.form, params.precision, config.swankRats.hitValue);
                CurrentGame.save(function(err) {
                    if (err) {
                        throw new Error('Game could not be updated after hit!');
                    }
                });
            } else {
                throw new Error('server hit listener: form or precision not set!');
            }
        }
    };
};

/**
 * Returns listeners for robots
 * @return {}
 */
exports.getRobotListener = function() {
    return {
        init: function(socket, params) {
            if (!!params.form) {
                console.log('##### Robot-Init ' + params.form);
                RobotsSockets[params.form] = socket;
            }
        }
    };
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Updates an existing game with new players
 * @param req
 * @param res
 */
exports.put = function(req, res) {
    var players = req.body.players || null,
        response;

    Game.findOne({'_id': req.params.gameId}, function(err, game) {
        if (!!game) {
            response = updateGame(game, players);
            if (!(response instanceof Error)) {
                game.save(function(err) {
                    if (err) {
                        return res.json(500, {error: 'Game could not be updated!'});
                    }
                    res.json(game);
                });
            } else {
                return res.json(500, {error: response.message});
            }
        } else {
            return res.json(500, {error: 'Game not found (' + req.params.gameId + ')!'});
        }
    }.bind(this));
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Creates a game with the waiting status or processes actions
 * @param req
 * @param res
 */
exports.post = function(req, res) {
    var response = null;
    if (!!req.query && !!req.query.action && !!req.game) {
        // FIXME: just for development
        if (req.query.action === 'hit' && !!req.body.player) { // hit player
            playerGotHit(req.body.player, 1, config.swankRats.hitValue);
            CurrentGame.save(function(err) {
                if (err) {
                    return res.json(500, {error: 'Game could not be updated!'});
                }
                res.json(CurrentGame);
            }.bind(this));
        } else if (req.game.status === GameStatus.ready) { //game state change
            response = updateGame(req.game);
            if (!(response instanceof Error)) {
                CurrentGame.save(function(err) {
                    if (err) {
                        return res.json(500, {error: 'Game could not be updated!'});
                    }
                    res.json(CurrentGame);
                });
            } else {
                return res.json(500, {error: response.message});
            }
        } else {
            return res.json(500, {error: 'Cannot start the game!'});
        }
    } else {
        if (!req.game && !!req.body.players && !!req.body.players.user && req.body.players.form) {
            return createNewGame(req.body.players.user, req.body.players.form, res);
        }
        return res.json(500, {error: 'Cannot create the game!'});
    }
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Returns the configuration for the swank rats game
 * See /config/env/all.js
 * @param req
 * @param res
 */
exports.config = function(req, res) {
    if (!!config.swankRats) {
        res.json(config.swankRats);
    } else {
        res.json(500, {error: 'No config for swank rats found!'});
    }
};

/**
 * Returns a list of the latest 100 games sorted from newest to oldest or
 * filters according to given status params
 * @param req
 * @param res
 */
exports.get = function(req, res) {
    // get game by status
    if (!!req.query && !!req.query.status) {
        var params = [];
        // parse query params
        req.query.status.forEach(function(status) {
            params.push(JSON.parse(status));
        });

        // filter by status which should return only one game
        // otherwise the business logic failed
        Game.find({$or: params}).exec(function(err, games) {
            if (err) {
                return res.json(500, {
                    error: 'Cannot find games with the given status!',
                    params: req.query.status
                });
            }
            res.json(games);

            //FIXME for development?
            CurrentGame = games[0] || null;
        });
    } else {
        // list all games
        Game.find()
            .sort('-created')
            .populate('winner', 'username')
            .limit(100)
            .exec(function(err, games) {
                if (err) {
                    return res.json(500, {
                        error: 'Cannot list the games'
                    });
                }
                res.json(games);
            });
    }
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Find game by id - uses somehow the show function
 * Used by the routing file to inject game model
 */
exports.game = function(req, res, next, id) {
    Game.load(id, function(err, game) {
            if (err) {
                return next(err);
            }
            req.game = game;
            next();
        }
    );
};

/**
 * Show an game
 */
exports.show = function(req, res) {
    res.json(req.game);
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/

/**
 * Delete an game
 */
exports.destroy = function(req, res) {
    var game = req.game;
    game.remove(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the game!'
            });
        }
        res.json(game);

    });
};
