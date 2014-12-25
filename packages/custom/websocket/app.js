'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var Websocket = new ModuleFactory('websocket'),
    WebsocketServer = require('websocket-wrapper'),
    websocketSever;
/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Websocket.register(function(app, auth, database, https) {
    websocketSever = new WebsocketServer({server: https});

    websocketSever.registerListener('test', {echo: function(socket, params, data) {
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
    websocketSever.registerListener(name, listener);
};