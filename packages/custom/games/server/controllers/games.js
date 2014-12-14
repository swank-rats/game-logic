'use strict';

/**
 * Module dependencies.
 */

// TODO split code into multiple files

var mean = require('meanio'),
    config = mean.loadConfig(),
    mongoose = require('mongoose'),
    Util = require('util'),
    Game = mongoose.model('Game'),
    GameStatus = {
        ended: 'ended',
        started: 'started',
        ready: 'ready',
        waiting: 'waiting'
    },

// TODO check reset of values after game
    ImageServerSocket = {},
    RobotsSockets = {},
    ClientSockets = {},
    CurrentGame = {},
    RobotClientAssigment = [],

    /**
     * Updates the state
     * @param game
     * @param status
     * @param players
     * @param maxPlayers
     */
    updateGame = function(game, players, maxPlayers) {

        switch (game.status) {
            case GameStatus.ended:
                return new Error('A game can not be changed when it is already finished!');
            case GameStatus.started: // end game
                if (status === GameStatus.ended) {
                    game.status = status;
                    CurrentGame = null;
                    // TODO calculate highscore etc
                } else {
                    return new Error('A started game can only get in the finished state!');
                }
                break;
            case GameStatus.ready: // start game
                if (game.players.length === maxPlayers) {
                    // TODO inform all parties that a game has started
                    game.status = GameStatus.started;
                    CurrentGame = game;
                }
                break;
            case GameStatus.waiting: // update players
                if (!!players && Util.isArray(players)) {
                    if (!!game.players && game.players.length < maxPlayers && players.length <= maxPlayers) {
                        players.forEach(function(newPlayer) {
                            var duplicate = false;

                            game.players.forEach(function(player) {

                                if (newPlayer.form === player.form) {
                                    duplicate = true;
                                    return false;
                                }
                                //TODO uncommented for debugging/testing
//                                if (newPlayer.user._id === player.user._id) {
//                                    duplicate = true;
//                                    return false;
//                                }
                            }, this);

                            if (!duplicate) {
                                newPlayer.lifePoints = config.swankRats.players.lifePoints;
                                game.players.push(newPlayer);
                            }
                            duplicate = false;
                        }, this);
                    } else {
                        return new Error('Max number of players reached!');
                    }
                }

                // update state when max number of players is reached
                if (game.players.length === maxPlayers) {
                    game.status = GameStatus.ready;
                }
                break;
        }
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
     * Sets a connection between a robot and client
     * @param user
     * @param form
     */
    setRobotSocketForUser = function(user, form) {
        RobotClientAssigment[user] = form;
    };

// TODO uncomment when implemented
///**
// * Retrieves a robot for a client
// * @param user
// * @return {*}
// */
//getRobotSocketForUser = function(user) {
//    if (!!RobotClientAssigment[user]) {
//        var form = RobotClientAssigment[user];
//        return RobotsSockets[form];
//    }
//    return null;
//
//};

/**
 * Returns listeners for clients
 * @return {}
 */
exports.getClientListener = function() {
    return {
        init: function(socket, params, data) {
            if (!!params.user) { // TODO && !!RobotsSockets[data.form]
                ClientSockets[params.user] = socket;
                setRobotSocketForUser(params.user, data.form);
                socket.send(params.user + ' initialized the websocket connection!');
            }
        },
        move: function(socket, params, data) {
            if (!!params.user) { // TODO  && !!getRobotSocketForUser(params.user)
                if (!!params.started) {
                    // TODO uncomment when connected
                    //getRobotSocketForUser(params.user).send(getMessage('server','move', {started: params.started}, {user: params.user}));
                    socket.send(params.user + ' started moving: ' + data);
                } else {
                    // TODO uncomment when connected
                    //getRobotSocketForUser(params.user).send(getMessage('server','move', {started: params.started}, {user: params.user}));
                    socket.send(params.user + ' stopped moving: ' + data);
                }
            }
        },
        shoot: function(socket, params, data) {
            if (!!params.user) { // TODO  && !!ImageServerSocket
                if (!!params.started) {
                    // TODO uncomment when connected
                    //ImageServerSocket.send(getMessage('server','shoot', {}, {user: params.user}));
                    socket.send(params.user + ' started shooting: ' + data);
                } else {
                    // TODO relevant use case?
                    //ImageServerSocket.send(getMessage('server','shoot', {}, {user: params.user}));
                    socket.send(params.user + ' stopped shooting: ' + data);
                }
            }
        }
    };
};

/**
 * Returns listeners for image server
 * @return {}
 */
exports.getServerListener = function() {
    return {
        init: function(socket) {
            ImageServerSocket = socket;
            socket.send('Imageserver established the websocket connection!');
        },
        hit: function(socket, params, data) {
            if (!!params.user && !!data.points && data.points > 0) {
                // TODO
                // adjust livepoints of player
                // pass to client and show changes
                // game finished?

                ClientSockets[params.user].send(getMessage(
                    'game',
                    'hit',
                    params,
                    data.points
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
                //RobotClientAssigment = [];
            } else {
                return new Error('server hit listener: user not set or points invalid (' + data.points + ')!');
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

/**
 * Find game by id - uses somehow the show function
 */
exports.game = function(req, res, next, id) {
    Game.load(id, function(err, game) {
            if (err) {
                return next(err);
            }
            if (!game) {
                return next(new Error('Failed to load game ' + id));
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

/**
 * Create a game
 */
exports.create = function(req, res) {

    // TODO do not allow creating game while one is still active
    var game = new Game({
        status: GameStatus.waiting,
        players: [
            {
                user: req.body.players.user,
                form: req.body.players.form,
                lifePoints: config.swankRats.players.lifePoints
            }
        ]
    });

    // reset sockets
    ImageServerSocket = {};
    RobotsSockets = {};
    ClientSockets = {};
    CurrentGame = null;
    RobotClientAssigment = [];

    game.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot save the game'
            });
        }
        res.json(game);
    });
};

/**
 * Update a game
 */
exports.update = function(req, res) {
    var players = req.body.players || null,
        response;

    Game.findOne({'_id': req.params.gameId}, function(err, game) {

        if (!!game) {
            response = updateGame(game, players, config.swankRats.players.max);
            if (!response) {
                game.save(function(err) {
                    if (err) {
                        return res.json(500, {
                            error: 'Cannot update the game'
                        });
                    }
                    res.json(game);
                });
            } else {
                return res.json(500, {
                    error: response
                });
            }
        } else {
            return res.json(500, {
                error: 'Game not found!'
            });
        }
    }.bind(this));
};

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

/**
 * List of games
 */
exports.find = function(req, res) {

    if (!!req.query && !!req.query.status) {
        // filter by status
        Game.find({status: req.query.status}).exec(function(err, games) {
            if (err) {
                return res.json(500, {
                    error: 'Cannot find games with status ' + req.query.status
                });
            }
            res.json(games);
        });
    } else {
        // list all games
        Game.find().sort('-created').populate('winner', 'username').exec(function(err, games) {
            if (err) {
                return res.json(500, {
                    error: 'Cannot list the games'
                });
            }
            res.json(games);
        });
    }
};

/**
 * Returns the configuration for a game
 * @param req
 * @param res
 */
exports.config = function(req, res) {
    if (!!config.swankRats) {
        res.json(config.swankRats);
    } else {
        res.json('No config for swank rats found!');
    }
};

/**
 *
 * @param req
 * @param res
 */
exports.play = function(req, res) {
    // TODO start game
    console.log(req);
};
