'use strict';

angular.module('mean.games').controller('GamesController', ['$scope', '$stateParams', '$location', 'Global', 'Games', '$rootScope',
    function($scope, $stateParams, $location, Global, Games, $rootScope) {
        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

        /**
         * Find game with status ready to join
         * @return object with $promise property
         */
        var findReadyGame = function() {
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
            initWebsocket = function(){

                if(!$rootScope.websocket){
                    var connection = new WebSocket('wss://localhost:3001');

                    // When the connection is open, send some data to the server
                    connection.onopen = function () {
                        connection.send(JSON.stringify({to: 'game', cmd: 'echo', params: {toUpper: true}, data: 'testdata'}));
                    };

                    // Log messages from the server
                    connection.onmessage = function (e) {
                        console.log('Server: ' + e.data);
                    };

                    $rootScope.websocket = connection;
                } else {
                    $rootScope.websocket.send(JSON.stringify({to: 'game', cmd: 'echo', params: {toUpper: true}, data: 'testdata2'}));
                }
            };

        /*--------------------------------------------------------------------*/
        /* Index page related
         /*--------------------------------------------------------------------*/

        /**
         * Initialzes everything to create or join a game
         */
        $scope.init = function() {

            // TODO if there is a game and the player registered for it he should be forwarded to the game

            findReadyGame().$promise.then(function(response) {
                var currentGame = !!response[0] ? response[0] : null,
                    status = '',
                    colors = {
                        green: 'green',
                        red: 'red',
                        blue: 'blue'
                    };

                // TODO extract into config
                // joinable match
                if (!!currentGame && currentGame.players.length < 2) {
                    colors = getAvailableColors(currentGame.players, colors);
                    status = 'join';
                } else if (!currentGame) {
                    status = 'create';
                } else {
                    status = 'full';
                }

                // TODO via config - how?
                // TODO limit color selection when player already joined
                $scope.colors = colors;
                $scope.currentGame = currentGame;
                $scope.status = status;

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
                        $location.path('games-view');
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
                        $location.path('games-view');
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

            var response = findReadyGame(),
                user = $scope.global.user,
                game;

            response.$promise.then(function(response) {
                game = !!response[0] ? response[0] : null;

                // when there is a game ready and the user is a player show everything
                if (!!game && !!game.players && !!isUserRegisteredForGame(game, user)) {
                    $scope.valid = true;
                } else {
                    $location.path('games');
                }
            });

            initWebsocket();
        };

        /*--------------------------------------------------------------------*/
        /*--------------------------------------------------------------------*/
        /*--------------------------------------------------------------------*/
    }
]);
