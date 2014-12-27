'use strict';

angular.module('mean.games').controller('GamesIndexController', ['$scope', '$location', 'Global', 'Games', '$rootScope', '$http', '$q', 'GamesUtil', 'WebsocketUtil',
    function($scope, $location, Global, Games, $rootScope, $http, $q, gamesUtil, websocketUtil) {

        var GamesUtil = gamesUtil($rootScope, Games, $http, $q, $scope),
            WebsocketUtil = websocketUtil($rootScope, $scope);

        /*--------------------------------------------------------------------*/
        /* Index page related
         /*--------------------------------------------------------------------*/

        /**
         * Initializes everything to create or join a game
         */
        $scope.init = function() {

            // fetch configuration and store it in the global scope
            // afterwards get game
            GamesUtil.fetchConfiguration().then(
                function() {
                    GamesUtil.findCurrentGame().$promise.then(function(response) {
                        var currentGame = !!response[0] ? response[0] : null,
                            status = '',
                            forms = $rootScope.config.players.forms;

                        if (!!currentGame) {
                            // current player already registered for game
                            if (!!GamesUtil.isUserRegisteredForGame(currentGame, $scope.global.user)) {
                                $scope.player = GamesUtil.getPlayerByUser(currentGame, $scope.global.user);
                                WebsocketUtil.initWebsocket(
                                    $scope.global.user.username,
                                    $scope.player.form,
                                    $rootScope.config.socketServer
                                );
                                $location.path('games/' + currentGame._id + '/play');

                            // current player not registered and enough space
                            } else if (currentGame.players.length < $rootScope.config.players.max) {
                                forms = GamesUtil.getAvailableForms(currentGame.players, $rootScope.config.players.forms);
                                status = 'join';

                            // current player not registered and no space
                            } else {
                                // TODO implement watch only mode?
                                status = 'full';
                            }
                        } else {
                            status = 'create';
                        }

                        $scope.forms = forms;
                        $scope.currentGame = currentGame;
                        $scope.status = status;
                    });
                }, function(data, status, headers) {
                    console.error({
                        data: data,
                        status: status,
                        headers: headers
                    });
                });
        };

        /**
         * Create a new game or a join an existing one
         * @param isValid
         */
        $scope.createOrJoinGame = function(isValid) {

            // TODO refactor
            if (!!isValid && !!this.selectedForm) {
                var game;

                // create game
                if (!$scope.currentGame) {
                    game = new Games({
                            players: {
                                form: this.selectedForm,
                                user: $scope.global.user
                            }
                        }
                    );

                    game.$save(function(Game) {
                        $scope.currentGame = Game;
                        $location.path('/games/' + Game._id + '/play');
                    });

                    // join game
                } else if (!!$scope.currentGame) {
                    game = $scope.currentGame;
                    game.players.push({
                        form: this.selectedForm,
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
    }
]);
