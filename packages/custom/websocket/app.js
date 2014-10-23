'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Websocket = new Module('websocket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Websocket.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Websocket.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Websocket.menus.add({
        title: 'websocket example page',
        link: 'websocket example page',
        roles: ['authenticated'],
        menu: 'main'
    });

    Websocket.aggregateAsset('css', 'websocket.css');



    return Websocket;
});
