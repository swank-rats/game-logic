'use strict';

var games = require('../controllers/games');

module.exports = function(Games, app, auth) {

    // routes
    app.route('/games')
        .get(auth.requiresLogin, games.all)
        .post(auth.requiresLogin, games.create);

    app.route('/games/:gameId')
        .get(auth.requiresLogin, games.show);

    app.param('gameId', games.game);
};
