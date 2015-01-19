'use strict';

var games = require('../controllers/games');

module.exports = function(Games, app, auth) {

    // routes
    app.route('/games')
        .get(auth.requiresLogin, games.get)
        .post(auth.requiresLogin, games.post);

    app.route('/games/:gameId')
        .put(auth.requiresLogin, games.put)
        .post(auth.requiresLogin, games.post);

    app.param('gameId', games.game);

    app.route('/games-config')
        .get(auth.requiresLogin, games.config);
};
