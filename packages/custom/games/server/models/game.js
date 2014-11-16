'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Game Schema
 */
var GameSchema = new Schema({
    started: {
        type: Date,
        required: false
    },
    ended: {
        type: Date,
        required: false
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    winner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    players: [],
    status: {
        type: String,
        required: true
    }
});

/**
 * Validations
 */
GameSchema.path('status').validate(function(status) {
    return !!status;
}, 'Status cannot be blank');

/**
 * Defines which properties of references get populated
 */
GameSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
//    .populate('user', 'username')
};

mongoose.model('Game', GameSchema);
