'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Highscores = new Module('highscores');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Highscores.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Highscores.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Highscores.menus.add({
    title: 'Highscores',
    link: 'highscores-show',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Highscores.aggregateAsset('css', 'highscores.css');

  return Highscores;
});
