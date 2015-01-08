'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var Websocket = new ModuleFactory('websocket'),
    WebsocketWrapper = require('websocket-wrapper').WebsocketWrapper,
    wsWrapper;
/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Websocket.register(function(app, auth, database, http) {
    wsWrapper = new WebsocketWrapper({port: 2000});

    wsWrapper.addListener('test', {
        echo: function(socket, params, data) {
        if (!!params.toUpper) {
            data = data.toUpperCase();
        }
        socket.send(data);
    }});

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
