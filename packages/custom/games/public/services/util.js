'use strict';

angular.module('mean.games').service('GamesUtil', [function() {

    return function($rootScope, Games, $http, $q, $scope) {

        return {

            /**
             * Find game with status ready to join
             * @return object with $promise property
             */
            findReadyGame: function() {
                return Games.query({status: 'ready'}, function(response) {
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

                angular.forEach(game.players, function(value) {
                    if (value.user._id === user._id) {
                        isRegistered = true;
                        return false;
                    }
                }, this);

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
            initWebsocket: function() {

                // TODO replace with proper initialization
                if (!$rootScope.websocket) {
                    var connection = new WebSocket('wss://localhost:3001');

                    // When the connection is open, send some data to the server
                    connection.onopen = function() {
                        connection.send(JSON.stringify({
                            to: 'game',
                            cmd: 'echo',
                            params: {toUpper: true},
                            data: 'testdata'
                        }));
                    };

                    // Log messages from the server
                    connection.onmessage = function(e) {
                        console.log('Server: ' + e.data);
                    };

                    $rootScope.websocket = connection;
                } else {
                    $rootScope.websocket.send(JSON.stringify({
                        to: 'game',
                        cmd: 'echo',
                        params: {toUpper: true},
                        data: 'testdata2'
                    }));
                }
            },

            /**
             * Sends a message through the websocket
             * @param to
             * @param cmd
             * @param params
             * @param data
             */
            sendMessage: function(to, cmd, params, data) {
                if (!!$rootScope.websocket) {
                    $rootScope.websocket.send(JSON.stringify({
                        to: to,
                        cmd: cmd,
                        params: params,
                        data: data
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
            }

        };
    };
}]);
