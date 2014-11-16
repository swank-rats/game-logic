'use strict';

angular.module('mean.games').config(['$stateProvider',
    function($stateProvider) {

        /**
         * Check if the user is connected
         * @param $q
         * @param $timeout
         * @param $http
         * @param $location
         * @returns {*}
         */
        var checkLoggedin = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0') {
                    $timeout(deferred.resolve);
                } else {
                    $timeout(deferred.reject);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };

        $stateProvider.state('games', {
            url: '/games',
            templateUrl: 'games/views/index.html',
            resolve: {
                loggedin: checkLoggedin
            }
        });

        $stateProvider.state('game-play', {
            url: '/games/:gameId/play',
            templateUrl: 'games/views/view.html',
            resolve: {
                loggedin: checkLoggedin
            }
        });
    }
]);
