'use strict';

var highscores = require('../controllers/highscores');

module.exports = function(Highscores, app) {

    // routes
    app.route('/highscores').get(highscores.all);
    app.route('/highscores/:highscoreId').get(highscores.show);

    app.param('highscoreId', highscores.highscore);
};
