'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var module = new ModuleFactory('websocket'),
    WebsocketFactory = require('ws').Server,
    server,

    guid = function() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }

        return _p8() + _p8(true) + _p8(true) + _p8();
    },

    /**
     * Initiate websocket server with given http server
     * @param http
     */
    init = function(http) {
        server = new WebsocketFactory({server: http});

        server.on('connection', onConnection);
    },

    onConnection = function(socket) {
        socket.id = guid();

        socket.on('message', function(message) {
            onMessage(socket, message);
        });

        socket.on('close', function() {
            onClose(socket);
        });
    },

    onMessage = function(socket, message) {
        console.log('received (%s): %s', socket.id, message);
        socket.send(message);
    },

    onClose = function(socket) {
        console.log('closed: %s', socket.id);
    };

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
module.register(function(app, auth, database, http) {

    //We enable routing. By default the Package Object is passed to the routes
    module.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    module.menus.add({
        title: 'websocket example page',
        link: 'websocket example page',
        roles: ['authenticated'],
        menu: 'main'
    });

    module.aggregateAsset('css', 'websocket.css');

    init(http);

    return module;
});
