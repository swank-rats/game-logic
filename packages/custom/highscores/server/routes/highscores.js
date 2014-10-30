'use strict';

var highscores = require('../controllers/highscores');

module.exports = function(Highscores, app, auth) {

    // routes
    app.route('/highscores')
        .get(auth.requiresLogin, highscores.all);

    app.route('/highscores/:highscoreId')
        .get(auth.requiresLogin, highscores.show);

    app.param('highscoreId', highscores.highscore);
};
