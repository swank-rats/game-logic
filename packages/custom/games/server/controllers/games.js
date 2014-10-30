'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    gameStatus = {
        ready: 'ready',
        started: 'started',
        ended: 'ended'
    };

exports.ws = function(req, res) {
    // TODO init for websocket tests
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
    var game = new Game({
        status: gameStatus.ready,
        players: [
            {
                user: req.user,
                color: req.body.color
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
    var game = Game.find({'_id': req.id});

    // player joined
    if (!!req.player) {
        if (game.status === gameStatus.ready) {

//            TODO check for unique color and player

            game.players.push({
                user: req.player,
                color: req.color
            });
        } else {
            return res.json(500, {
                error: 'Cannot update the game'
            });
        }
        // status change (start, end)
    } else if (!!req.status) {
        switch (req.status) {
            case gameStatus.started:
                game.status = gameStatus.started;
                game.started = Date.now;
                // TODO Start game logic and ws
                break;
            case gameStatus.ended:
                game.status = gameStatus.ended;
                game.ended = Date.now;
                // TODO stop game logic and ws
                break;
        }
    }

    game.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the game'
            });
        }
        res.json(game);

    });
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
exports.all = function(req, res) {

//    var game = new Game({
//        status: gameStatus.ended,
//        started: Date.now(),
//        ended: Date.now(),
//        players: [
//            {
//                userId: '54317a258be33a840415bb50',
//                color: 'red'
//            },
//            {
//                userId: '4317a258be33a840415bb50',
//                color: 'green'
//            }
//        ]
//    });
//
//
//    game.save(function(err) {
//        if (err) {
//            return res.json(500, {
//                error: 'Cannot update the game'
//            });
//        }
//        res.json(game);
//
//    });

//    // population info needs to stay here because findAll in models does not work
    Game.find().sort('-created').populate('winner', 'username').exec(function(err, games) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the games'
            });
        }
        res.json(games);
    });
};

/**
 * get pending game
 */
exports.ready = function(req, res) {
    // population info needs to stay here because findAll in models does not work
    Game.findOne({'status': gameStatus.ready}).exec(function(err, games) {
        if (err) {
            return res.json(500, {
                error: 'Cannot find ready game!'
            });
        }
        res.json(games);
    });
};
