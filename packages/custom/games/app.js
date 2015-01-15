'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var Games = new Module('games');
var GamesController = require('./server/controllers/games');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Games.register(function(app, auth, database, websocket, highscores) {

    //We enable routing. By default the Package Object is passed to the routes
    Games.routes(app, auth, database);

    websocket.addListener('game', GamesController.getClientListener());
    websocket.addListener('server', GamesController.getImageServerListener());
    websocket.addListener('robot', GamesController.getRobotListener());
    GamesController.registerHighscores(highscores);

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
