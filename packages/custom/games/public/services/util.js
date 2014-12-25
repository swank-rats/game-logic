'use strict';

angular.module('mean.games').service('GamesUtil', [function() {

    return function($rootScope, Games, $http, $q, $scope) {

        return {

            /**
             * Find current game
             * @return object with $promise property
             */
            findCurrentGame: function() {
                return Games.query({status: [{status: 'ready'}, {status: 'waiting'}]}, function(response) {
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
             * Initializes the websocket
             */
            initWebsocket: function(username, form, wssUrl) {
                if (!$rootScope.websocket) {
                    var connection = new WebSocket(wssUrl);
                    $rootScope.websocket = connection;

                    connection.onopen = function() {
                        connection.send(JSON.stringify({
                            to: 'game',
                            cmd: 'init',
                            params: {
                                user: username,
                                form: form
                            }
                        }));
                    };

                    connection.onmessage = function(e) {
                        if (e.data.indexOf('{') > -1) {
                            var data = JSON.parse(e.data);
                            if (!!data.cmd) {
                                switch (data.cmd) {
                                    case 'changedStatus':
                                        $scope.$emit('statusChanged', data);
                                        break;
                                }
                            }
                        } else {
                            console.log('Server: ' + e.data);
                        }
                    };
                }
            },

            /**
             * Sends a message through the websocket
             * @param to
             * @param cmd
             * @param params
             */
            sendMessage: function(to, cmd, params) {
                if (!!$rootScope.websocket) {
                    $rootScope.websocket.send(JSON.stringify({
                        to: to,
                        cmd: cmd,
                        params: params
                    }));
                } else {
                    console.error('No websocket found!');
                }
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
