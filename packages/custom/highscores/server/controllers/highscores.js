'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Highscore = mongoose.model('Highscore');

/**
 * Find highscore by id - uses somehow / magically the show function
 */
exports.highscore = function(req, res, next, id) {
    Highscore.load(id, function(err, highscore) {
        if (err) return next(err);
        if (!highscore) return next(new Error('Failed to load highscore ' + id));
        req.highscore = highscore;
        next();
    });
};

/**
 * Show an highscore
 */
exports.show = function(req, res) {
    res.json(req.highscore);
};

/**
 * Create a highscore
 */
exports.create = function(req, res) {
    var highscore = new Highscore({
        score: req.body.score,
        user: req.user,
        changed: new Date(),
        created: new Date()
    });

    highscore.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot save the highscore'
            });
        }
        res.json(highscore);
    });
};

/**
 * Update an highscore
 */
exports.update = function(req, res) {
    var highscore = req.highscore;
    highscore.score = req.body.score;
    highscore.changed = new Date();

    highscore.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the highscore'
            });
        }
        res.json(highscore);

    });
};

/**
 * Delete an highscore
 */
exports.destroy = function(req, res) {
    var highscore = req.article;

    highscore.remove(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the highscore'
            });
        }
        res.json(highscore);

    });
};

/**
 * List of Highscores
 */
exports.all = function(req, res) {
    // population info needs to stay here because findAll in models does not work
    Highscore.find().sort('-score').populate('user', 'username').exec(function(err, highscores) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the highscores'
            });
        }
        res.json(highscores);

    });
};
