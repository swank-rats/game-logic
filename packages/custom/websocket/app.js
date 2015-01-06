'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var Websocket = new ModuleFactory('websocket'),
    WebsocketServer = require('websocket-wrapper').WebsocketWrapper,
    websocketSever;

var httpBasic = require('basic-auth');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Q = require('q');

var sockets = {};

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Websocket.register(function(app, auth, database, https, passport) {
    https.on('upgrade', function(req, socket, head) {
        var basicUser = httpBasic(req),
            def = Q.defer();

        req.prom = def.promise;

        User.findOne({
            email: basicUser.name
        }, function(err, user) {
            if (err || !user || !user.authenticate(basicUser.pass)) {
                def.reject();
            }else {
                req.user = user;
                def.resolve();
            }
        });
    }.bind(this));

    websocketSever = new WebsocketServer({server: https});

    websocketSever.on('connection', function(event, socket) {
        socket.upgradeReq.prom.then(function() {
            var username = socket.upgradeReq.user.get('name');

            sockets[username] = socket;
        });

        socket.upgradeReq.prom.fail(function() {
            socket.close();
        });
    });

    websocketSever.addListener('test', {echo: function(socket, params, data) {
        if (!!params.toUpper) {
            data = data.toUpperCase();
        }
        socket.send(data);
    }});

    return Websocket;
});

/**
 * register _listener for websockets library
 * @param {String} name
 * @param {Object} listener
 */
Websocket.registerListener = function(name, listener) {
    websocketSever.addListener(name, listener);
};
