'use strict';

/**
 * Module dependencies.
 */

// TODO split code into multiple files and refactor
// TODO check reset of values after game!!!
// TODO init image server and robots

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

// FIXME just for development
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
     * Merges the new player list with the existing one on the game
     * @param players
     * @param game
     */
    mergePlayers = function(players, game) {
        //FIXME could be reducted to one loop when the request is refactored
        players.forEach(function(newPlayer) {
            var duplicate = false;
            game.players.forEach(function(player) {
                if (newPlayer.form === player.form || newPlayer.user._id === player.user._id) {
                    duplicate = true;
                    return false;
                }
            }, this);

            if (!duplicate) {
                newPlayer.lifePoints = config.swankRats.players.lifePoints;
                game.players.push(newPlayer);
            }
            duplicate = false;
        }, this);
    },

    /**
     * Sends a message through the websocket
     * @param to
     * @param cmd
     * @param params
     * @param data
     */
    getMessage = function(to, cmd, params, data) {
        return JSON.stringify({
            to: to,
            cmd: cmd,
            params: params,
            data: data
        });
    },

    /**
     * Sets a connection between a client and a robot with username and form
     * @param user
     * @param form
     */
    setRobotSocketForUser = function(user, form) {
        if (!!RobotsSockets[form]) {
            ClientRobotAssigment[user] = RobotsSockets[form];
        } else {
            throw new Error('Robot with form ' + form + ' not found!');
        }
    },

    /**
     * Sends a message to all clients
     * @param data
     */
    sendMessageToAllClients = function(data) {
        for (var socket in ClientSockets) {
            if (ClientSockets.hasOwnProperty(socket)) {
                ClientSockets[socket].send(JSON.stringify(data));
            }
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
     * Sends a message to the image server
     * @param to
     * @param cmd
     * @param params
     * @param data
     */
    sendMessageToImageServer = function(to, cmd, params, data) {
        if (!!ImageServerSocket) {
            params = !!params ? params : {};
            data = !!data ? data : {};
            ImageServerSocket.send(getMessage(to, cmd, params, data));
        } else {
            throw new Error('ImageServer not initialized!');
        }
    },

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
                if (status === GameStatus.ended) {
                    game.status = GameStatus.ended;
                    game.ended = Date.now();
                    sendMessageToImageServer('server','stop');
                    CurrentGame = null;
                    // TODO calculate highscore etc
                    // image server
                    //cmd: stop (mehr nicht, von dir, zu mir)
                } else {
                    return new Error('A started game can only get in the finished state!');
                }
                break;
            case GameStatus.ready: // start game
                if (game.players.length === maxPlayers) {
                    game.status = GameStatus.started;
                    game.started = Date.now();
                    CurrentGame = game;
                    sendMessageToImageServer('server','start');
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
                socket.send(params.user + ' initialized the websocket connection!');
            }
        },
        move: function(socket, params) {
            if (!!params.user && CurrentGame.status === GameStatus.started && !!params.cmd) {
                if (!!params.started) {
                    ClientRobotAssigment[params.user].send(
                        getMessage(
                            'server',
                            'move',
                            {started: params.started, user: params.user}
                        ));
                    socket.send(params.user + ' started moving: ' + params.cmd);
                } else {
                    ClientRobotAssigment[params.user].send(
                        getMessage(
                            'server',
                            'move',
                            {started: params.started, user: params.user}
                        ));
                    socket.send(params.user + ' stopped moving: ' + params.cmd);
                }
            }
        },
        shoot: function(socket, params) {
            if (!!params.user && CurrentGame.status === GameStatus.started) {
                if (!!params.started) {
                    ImageServerSocket.send(getMessage('server', 'shot', {player: params.user}));
                    socket.send(params.user + ' shot!');
                }
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
            socket.send('Imageserver established the websocket connection!');
        },
        hit: function(socket, params) {
            if (!!params.player && !!params.precision && params.points > 0) {
                // TODO
                // adjust livepoints of player
                // pass to client and show changes
                // game finished?

                ClientSockets[params.user].send(getMessage(
                    'game',
                    'hit',
                    params,
                    params.precision
                ));

                // TODO
                // update game state (end game) / set highscore etc
                // tell all parties that the game is over
                //ImageServerSocket.send(getMessage('server', 'stop', {},{}));
                //RobotsSockets.forEach(function(robotSocket, key){
                //    robotSocket.send(getMessage('server', 'stop', {},{}));
                //    ClientSockets[key].send(getMessage('server', 'stop', {},{}));
                //}.bind(this));
                //RobotsSockets = {};
                //ClientSockets = {};
                //ClientRobotAssigment = [];
            } else {
                throw new Error('server hit listener: user not set or points invalid (' + params.precision + ')!');
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
        init: function(socket, params, data) {
            RobotsSockets[data.form] = socket;
            socket.send('Robot ' + data.form + ' established the websocket connection!');
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
    if (!!req.query && !!req.query.action && !!req.game) {
        if (req.game.status === GameStatus.ready) {
            var response = updateGame(req.game);
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
            return res.json(500,{error: 'Cannot start the game!'});
        }
    } else {
        if (!req.game && !!req.body.players && !!req.body.players.user && req.body.players.form) {
            return createNewGame(req.body.players.user, req.body.players.form, res);
        }
        return res.json(500,{error: 'Cannot create the game!'});
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

            //
            CurrentGame = games[0];
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
                error: 'Cannot delete the game'
            });
        }
        res.json(game);

    });
};
