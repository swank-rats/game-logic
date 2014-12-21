'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var Games = new Module('games');
var GamesController = require('./server/controllers/games');
//var Websocket = require('websocket').Module;

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Games.register(function(app, auth, database, websocket) {

    //We enable routing. By default the Package Object is passed to the routes
    Games.routes(app, auth, database);

    websocket.registerListener('game', GamesController.getClientListener());
    websocket.registerListener('server', GamesController.getImageServerListener());
    websocket.registerListener('robot', GamesController.getRobotListener());

    //We are adding a link to the main menu for all authenticated users
    Games.menus.add({
        title: 'Games',
        link: 'games',
        roles: ['authenticated'],
        menu: 'main'
    });

    Games.aggregateAsset('css', 'games.css');

    return Games;
});
