'use strict';

angular.module('mean.games').factory('Games',  ['$resource',
    function($resource) {
        return $resource('games/:gameId', {
            highscoreId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
