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

                    // TODO if there is a game and the player registered for it he should be forwarded to the game
                    Util.findReadyGame().$promise.then(function(response) {
                        var currentGame = !!response[0] ? response[0] : null,
                            status = '',
                            forms = $rootScope.config.players.forms;

                        // joinable match
                        if (!!currentGame && currentGame.players.length < $rootScope.config.players.max) {
                            forms = Util.getAvailableForms(currentGame.players, $rootScope.config.players.forms);
                            status = 'join';
                        } else if (!currentGame) {
                            status = 'create';
                        } else {
                            status = 'full';
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
