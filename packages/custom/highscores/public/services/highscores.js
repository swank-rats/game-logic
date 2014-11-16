'use strict';

angular.module('mean.highscores').factory('Highscores',  ['$resource',
    function($resource) {
        return $resource('highscores/:highscoreId', {
            highscoreId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
