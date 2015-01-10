'use strict';

angular.module('mean.games').service('GamesUtil', [function() {

    return function($rootScope, Games, $http, $q, $scope) {

        return {

            /**
             * Sends the request to hit a player
             * @param game
             * @param data
             * FIXME: Just for development
             */
            hitPlayer: function(game, data) {
                var url = '/games/' + game._id + '?action=hit';
                data = !!data ? data : {};

                $http.post(url, data).
                    error(function(data, status, headers) {
                        console.error(
                            'Error while starting game!',
                            {data: data, status: status, headers: headers}
                        );
                    });
            },

            /**
             * Starts a given game
             * @param game
             * @param data
             */
            startGame: function(game, data){
                var url = '/games/'+game._id+'?action=start';
                data = !!data ? data : {};

                $http.post(url, data).
                    error(function(data, status, headers) {
                        console.error(
                            'Error while starting game!',
                            {data:data, status:status, headers:headers}
                        );
                    });
            },

            /**
             * Find current game
             * @return object with $promise property
             */
            findCurrentGame: function() {
                var statuses = [{status: 'ready'}, {status: 'waiting'}, {status: 'started'}];
                return Games.query({status: statuses}, function(response) {
                    return !!response[0] ? response[0] : null;
                });
            },

            /**
             * Checks if a user is registered for a game
             * @param game
             * @param user
             * @return {boolean}
             */
            isUserRegisteredForGame: function(game, user) {
                var isRegistered = false;
                if (!!user && !!game && game.players.length > 0) {
                    angular.forEach(game.players, function(player) {
                        if (player.user._id === user._id) {
                            isRegistered = true;
                            return false;
                        }
                    }, this);
                }
                return isRegistered;
            },

            /**
             * Removes already chosen forms from array
             * @param players
             * @param forms
             */
            getAvailableForms: function(players, forms) {
                angular.forEach(players, function(player) {
                    if (!!forms[player.form]) {
                        delete forms[player.form];
                    }
                }, this);

                return forms;
            },

            /**
             * Returns command for key
             * @param key
             * @return {string}
             */
            getCommandFromKeyEvent: function(key) {
                switch (key) {
                    // A
                    case 65:
                        return 'left';
                    // S
                    case 83:
                        return 'backwards';
                    // D
                    case 68:
                        return 'right';
                    // W
                    case 87:
                        return 'straight';
                    // L
                    case 76:
                        return 'shoot';
                    default:
                        return '';
                }
            },

            /**
             * Fetches the configuration for games and stores it in $rootScope.config
             * @return Promise
             */
            fetchConfiguration: function() {
                var deferred = $q.defer();
                if (!$rootScope.config) {
                    $http.get('/games-config').
                        success(function(data) {
                            $rootScope.config = data;
                            deferred.resolve(data);
                        }).
                        error(function(data, status, headers) {
                            deferred.reject(data, status, headers);
                        });
                } else {
                    deferred.resolve($scope.global.config);
                }
                return deferred.promise;
            },

            /**
             * Returns the player associated with the user-account
             * @param game
             * @param user
             * @return {string}
             */
            getPlayerByUser: function(game, user) {
                var currentPlayer = null;
                if ((!!game && !!game.players && !!user)) {
                    angular.forEach(game.players, function(player) {
                        if (player.user._id === user._id) {
                            currentPlayer = player;
                            return false;
                        }
                    }, this);
                }
                return currentPlayer;
            }
        };
    };
}]);
