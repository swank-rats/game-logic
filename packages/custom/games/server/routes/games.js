'use strict';

var games = require('../controllers/games');

module.exports = function(Games, app, auth) {

    // routes
    app.route('/games')
        .get(auth.requiresLogin, games.find)
        .post(auth.requiresLogin, games.create);

    app.route('/games/:gameId')
        .get(auth.requiresLogin, games.show)
        .put(auth.requiresLogin, games.update);

    app.param('gameId', games.game);
};
