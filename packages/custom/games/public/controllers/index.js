'use strict';

angular.module('mean.games').controller('GamesIndexController', ['$scope', '$stateParams', '$location', 'Global', 'Games', '$rootScope', '$http', '$q', 'GamesUtil',
    function($scope, $stateParams, $location, Global, Games, $rootScope, $http, $q, gamesUtil) {

        var Util = gamesUtil($rootScope, Games, $http, $q, $scope);

        /*--------------------------------------------------------------------*/
        /* Index page related
         /*--------------------------------------------------------------------*/

        /**
         * Initialzes everything to create or join a game
         */
        $scope.init = function() {

            // fetch configuration and store it in the global scope
            // afterwards get game
            Util.fetchConfiguration().then(
                function() {
                    Util.findCurrentGame().$promise.then(function(response) {
                        var currentGame = !!response[0] ? response[0] : null,
                            status = '',
                            forms = $rootScope.config.players.forms;

                        // match waiting for another player
                        if (!!currentGame) {
                            // current player already registered for game
                            if (!!Util.isUserRegisteredForGame(currentGame, $scope.global.user)) {
                                Util.initWebsocket(
                                    $scope.global.user.username,
                                    Util.getFormForUserInGame($scope.global.user, currentGame),
                                    $rootScope.config.socketServer
                                );
                                $location.path('games/' + currentGame._id + '/play');
                            } else if (currentGame.players.length < $rootScope.config.players.max) { // current player not registered and space
                                forms = Util.getAvailableForms(currentGame.players, $rootScope.config.players.forms);
                                status = 'join';
                            } else { // current player not registered and no space
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
         * Create a new game
         * @param isValid
         */
        $scope.createOrJoinGame = function(isValid) {

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
