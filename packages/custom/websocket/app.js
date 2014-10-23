'use strict';

/*
 * Defining the Package
 */
var ModuleFactory = require('meanio').Module;

var module = new ModuleFactory('websocket'),
    WebsocketFactory = require('ws').Server,
    server,

    listener = {},

    /**
     * Generate uuid for client
     * @returns {string}
     */
    guid = function() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }

        return _p8() + _p8(true) + _p8(true) + _p8();
    },
    IsJsonString = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    /**
     * Initiate websocket server with given http server
     * @param {Object} http
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

    /**
     * Parses message and delegate to listener
     * @param {Object} socket
     * @param {String} message
     */
    onMessage = function(socket, message) {
        if (!IsJsonString(message)) {
            console.error('message validate error');
            return;
        }

        var data = JSON.parse(message),
            cmd = data.cmd || "default";

        if (!!data.to && !!listener.hasOwnProperty(data.to)) {
            listener[data.to][cmd](socket, data.params || {}, data.data || {});
        } else {
            console.warn('message ignored');
        }
    },

    /**
     * Handles closed socket
     * @param {Object} socket
     */
    onClose = function(socket) {
        console.warn('closed: %s', socket.id);
    };

// {"to":"echo", "cmd": "...", "params": [], "data": {...} }
// listener:
// {
//      "<cmd>": function(socket, parameter..., data){
//
//      }
// }

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

    module.listen('echo', {default: function(socket, params, data) {
        socket.send(socket.id + ':' + data);
    }});

    return module;
});

module.listen = function(name, object) {
    listener[name] = object;
};
