'use strict';

/**
 * Module dependencies.
 */

var mean = require('meanio'),
    config = mean.loadConfig(),
    mongoose = require('mongoose'),
    Util = require('util'),
    Game = mongoose.model('Game'),
    GameStatus = {
        ready: 'ready',
        full: ''
    },

    /**
     * Updates the state
     * @param game
     * @param status
     * @param players
     */
    updateGame = function(game, status, players) {

        switch (game.status) {
            case GameStatus.ended:
                return new Error('A game can not be changed when it is already finished!');
            case GameStatus.ready:

                // update players
                if (!!players && Util.isArray(players)) {
                    // TODO extract max number of players into config
                    if (!!game.players && game.players.length < 2 && players.length <= 2) {
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
                                game.players.push(newPlayer);
                            }
                            duplicate = false;
                        }, this);
                    } else {
                        return new Error('Max number of players reached!');
                    }
                }
                // update state
                if (status === GameStatus.started || status === GameStatus.ended) {
                    game.status = status;
                }
                break;
            case GameStatus.started:
                if (status === GameStatus.ended) {
                    game.status = status;
                } else {
                    return new Error('A started game can only get in the finished state!');
                }
                break;
        }
    };

/**
 * Returns listeners for websockets
 * @return {{echo: echo}}
 */
exports.getListener = function() {
    return {
        echo: function(socket, params, data) {
            if (!!params.toUpper) {
                data = data.toUpperCase();
            }
            socket.send(data);
        },
        move: function(socket, params, data) {
            if (!!params.started) {
                socket.send(params.user+' started action: '+data);
            } else {
                socket.send(params.user+' stopped action: '+data);
            }
        }
    };
};

/**
 * Find game by id - uses somehow / magically the show function
 */
exports.game = function(req, res, next, id) {
    Game.load(id, function(err, game) {
        if (err) return next(err);
        if (!game) return next(new Error('Failed to load game ' + id));
        req.game = game;
        next();
    });

    exports.getListener();
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

    // TODO do not allow creating game while one is active

    var game = new Game({
        status: GameStatus.ready,
        players: [
            {
                user: req.body.players.user,
                form: req.body.players.fprm || 'pentagon'
            }
        ]
    });

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
        status = req.body.status || null,
        response;

    Game.findOne({'_id': req.params.gameId}, function(err, game) {

        if (!!game) {
            response = updateGame(game, status, players);
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
        res.json('');
    }
};

/**
 *
 * @param req
 * @param res
 */
exports.play = function(req, res) {
    console.log(req);
};
