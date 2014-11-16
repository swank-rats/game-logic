'use strict';

angular.module('mean.games').controller('GamesController', ['$scope', '$stateParams', '$location', 'Global', 'Games', '$rootScope', '$http', '$q',
    function($scope, $stateParams, $location, Global, Games, $rootScope, $http, $q) {

        var pressedKeys = [],

        /*--------------------------------------------------------------------*/
        /* Util
        /*--------------------------------------------------------------------*/

            /**
             * Find game with status ready to join
             * @return object with $promise property
             */
            findReadyGame = function() {
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
            isUserRegisteredForGame = function(game, user) {

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
             * Removes already chosen color from array
             * @param players
             * @param colors
             */
            getAvailableColors = function(players, colors) {
                angular.forEach(players, function(player) {
                    if (!!colors[player.color]) {
                        delete colors[player.color];
                    }
                }, this);

                return colors;
            },

            /**
             * Initializes the websocket
             */
            initWebsocket = function() {

                if (!$rootScope.websocket) {
                    var connection = new WebSocket('wss://localhost:3001');

                    // When the connection is open, send some data to the server
                    connection.onopen = function() {
                        connection.send(JSON.stringify({to: 'game', cmd: 'echo', params: {toUpper: true}, data: 'testdata'}));
                    };

                    // Log messages from the server
                    connection.onmessage = function(e) {
                        console.log('Server: ' + e.data);
                    };

                    $rootScope.websocket = connection;
                } else {
                    $rootScope.websocket.send(JSON.stringify({to: 'game', cmd: 'echo', params: {toUpper: true}, data: 'testdata2'}));
                }
            },

            /**
             * Sends a message through the websocket
             * @param to
             * @param cmd
             * @param params
             * @param data
             */
            sendMessage = function(to, cmd, params, data) {
                if (!!$rootScope.websocket) {
                    $rootScope.websocket.send(JSON.stringify({to: to, cmd: cmd, params: params, data: data}));
                } else {
                    console.error('No websocket found!');
                }
            },

            /**
             * Returns command for key
             * @param key
             * @return {string}
             */
            getCommandFromKeyEvent = function(key) {
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
            fetchConfiguration = function() {
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
            };

        /*--------------------------------------------------------------------*/
        /* General
        /*--------------------------------------------------------------------*/

        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

        /*--------------------------------------------------------------------*/
        /* Index page related
        /*--------------------------------------------------------------------*/

        /**
         * Initialzes everything to create or join a game
         */
        $scope.init = function() {

            // fetch configuration and store it in the global scope
            // afterwards get game
            fetchConfiguration().then(
                function() {

                    // TODO if there is a game and the player registered for it he should be forwarded to the game
                    findReadyGame().$promise.then(function(response) {
                        var currentGame = !!response[0] ? response[0] : null,
                            status = '',
                            colors = $rootScope.config.players.colors;

                        // joinable match
                        if (!!currentGame && currentGame.players.length < $rootScope.config.players.max) {
                            colors = getAvailableColors(currentGame.players, $rootScope.config.players.colors);
                            status = 'join';
                        } else if (!currentGame) {
                            status = 'create';
                        } else {
                            status = 'full';
                        }

                        $scope.colors = colors;
                        $scope.currentGame = currentGame;
                        $scope.status = status;

                    });
                }, function(data, status, headers) {
                    console.error({data: data, status: status, headers: headers});
                });
        };

        /**
         * Create a new game
         * @param isValid
         */
        $scope.createOrJoinGame = function(isValid) {

            if (!!isValid && !!this.selectedColor) {
                var game;

                // create game
                if (!$scope.currentGame) {
                    game = new Games({
                            players: {
                                color: this.selectedColor,
                                user: $scope.global.user
                            }}
                    );

                    game.$save(function(Game) {
                        $scope.currentGame = Game;
                        $location.path('/games/' + Game._id + '/play');
                    });

                    // join game
                } else if (!!$scope.currentGame) {
                    game = $scope.currentGame;
                    game.players.push({
                        color: this.selectedColor,
                        user: $scope.global.user
                    });

                    game.$update(function(Game) {
                        $scope.currentGame = Game;
                        $location.path('/games/' + Game._id + '/play');
                    });
                }

                // something went wrong
            } else {
                $location.path('games');
                $scope.currentGame = null;
                $scope.submitted = true;
            }

        };

        /*--------------------------------------------------------------------*/
        /* View page related
        /*--------------------------------------------------------------------*/

        /**
         * Checks if user is registered for current ready game
         */
        $scope.initGamesView = function() {

            fetchConfiguration().then(
                function() {
                    var response = findReadyGame(),
                        user = $scope.global.user,
                        game;

                    response.$promise.then(function(response) {
                        game = !!response[0] ? response[0] : null;
                        // when there is a game ready and the user is a player show everything
                        if (!!game && !!game.players && !!isUserRegisteredForGame(game, user)) {
                            $scope.server = $rootScope.config.streamServer;
                            initWebsocket();
                        } else {
                            // TODO show game without websocket and controlls
                            $location.path('games');
                        }
                    });
                },

                function(data, status, headers) {
                    console.error({data: data, status: status, headers: headers});
                }
            );
        };

        /**
         * Eventlistener for keypresses
         * @param event
         */
        $scope.keyDownAction = function(event) {
            if (!!$rootScope.websocket && !!event.which) {
                var cmd = getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) === -1) {
                    pressedKeys.push(cmd);
                    sendMessage('game', 'move',{started: true}, cmd);
                }
            }
        };

        /**
         * Eventlistener for keypresses
         * @param event
         */
        $scope.keyUpAction = function(event) {
            if (!!$rootScope.websocket && !!event.which) {
                var cmd = getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) > -1) {
                    pressedKeys.splice(pressedKeys.indexOf(cmd),1);
                    sendMessage('game', 'move',{started: false}, cmd);
                }
            }
        };

        /*--------------------------------------------------------------------*/
        /*--------------------------------------------------------------------*/
        /*--------------------------------------------------------------------*/
    }
]);
