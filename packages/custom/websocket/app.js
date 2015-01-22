'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var Websocket = new ModuleFactory('websocket'),
    WebsocketWrapper = require('websocket-wrapper').WebsocketWrapper,
    wsWrapper;

var mongoose = require('mongoose');

var basicAuth = require('basic-auth'),
    url = require('url');

var clients = {};

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Websocket.register(function(app, auth, database, https, passport) {
    this.passport = passport;
    var onUpgrade = function(req) {
        var httpUser = basicAuth(req);

        console.log(this.passport.authenticate('local')(req, {}, function(){}));

        if (httpUser === undefined) {
            var urlParts = url.parse(req.headers.origin);
            httpUser = urlParts.auth.split(':');
            httpUser = {name: httpUser[0], pass: httpUser[1]};
        }

        req.httpUser = httpUser;
    }.bind(this);

    https.on('upgrade', onUpgrade);

    wsWrapper = new WebsocketWrapper({server: https});
    wsWrapper.on('connection', function(event, socket) {
        var User = mongoose.model('User'),
            httpUser = socket.upgradeReq.httpUser;

        User.findOne({
            email: httpUser.name
        }, function(err, user) {
            if (err || !user || !user.authenticate(httpUser.pass)) {
                socket.close();
            } else {
                clients[user.name] = socket;
            }
        });
    });

    wsWrapper.addListener('test', {
        echo: function(socket, params, data) {
            if (!!params.toUpper) {
                data = data.toUpperCase();
            }
            socket.send(data);
        }
    });

    return Websocket;
});

/**
 * register listener for websockets library
 * @param {String} name
 * @param {Object} listener
 */
Websocket.addListener = function(name, listener) {
    wsWrapper.addListener(name, listener);
};

/**
 * register listener for websockets library
 * @param {String} username
 */
Websocket.getClient = function(username) {
    return clients[username];
};
