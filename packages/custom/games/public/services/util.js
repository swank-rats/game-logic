'use strict';

angular.module('mean.games').service('GamesUtil', [function() {

    return function($rootScope, Games, $http, $q, $scope) {

        return {

            /**
             * Starts a given game
             */
            startGame: function(game){
                var url = '/games/'+game._id+'?action=start';

                $http.post(url, {msg:'hello word!'}).
                    success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        console.log(data, status);
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log(data, status);
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
                        return 'forward';
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
             * Returns the form a player choose for a game
             * @param game
             * @param user
             * @return {string}
             */
            getFormForUserInGame: function(game, user) {
                var form = null;
                if ((!!game && !!game.players && !!user)) {
                    angular.forEach(game.players, function(player) {
                        if (player.user._id === user._id) {
                            form = player.form;
                            return false;
                        }
                    }, this);
                }
                return form;
            }
        };
    };
}]);
