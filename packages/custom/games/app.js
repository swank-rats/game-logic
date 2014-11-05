'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Games = new Module('games');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Games.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Games.routes(app, auth, database);

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