'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Highscore Schema
 */
var HighscoreSchema = new Schema({
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    changed: {
        type: Date,
        default: Date.now,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

/**
 * Validations
 */
HighscoreSchema.path('user').validate(function(user) {
    return !!user;
}, 'User cannot be blank');

HighscoreSchema.path('score').validate(function(score) {
    return !!score;
}, 'Score cannot be blank');

HighscoreSchema.path('changed').validate(function(changed) {
    return !!changed;
}, 'Changed cannot be blank');

HighscoreSchema.path('created').validate(function(created) {
    return !!created;
}, 'Created cannot be blank');

/**
 * Defines which properties of references get populated
 */
HighscoreSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'username').exec(cb);
};

mongoose.model('Highscore', HighscoreSchema);
