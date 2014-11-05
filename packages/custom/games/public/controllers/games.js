'use strict';

angular.module('mean.games').controller('GamesController', ['$scope', '$stateParams', '$location', 'Global', 'Games',
    function($scope, $stateParams, $location, Global, Games) {
        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

        /**
         * Initializes all for the screen
         */
        $scope.init = function() {

            // TODO via config - how?
            $scope.colors = {
                green: 'green',
                red: 'red',
                blue: 'blue'
            };

            $scope.findReadyGame();
        };

        /**
         * Find game with status ready to join
         */
        $scope.findReadyGame = function() {

            // TODO if there is a game and the player registered for it he should be forwarded to the game
            Games.query({status: 'ready'}, function(game) {
                $scope.currentGame = !!game[0] ? game[0] : null;
            });
        };

        /**
         * Create a new game
         * @param isValid
         */
        $scope.create = function(isValid) {
            if (!!isValid) {
                var game = new Games({
                        players: {
                            color: this.colors,
                            user: $scope.global.user
                        }}
                );
                game.$save(function(Game) {
                    $scope.currentGame = Game;
                    $location.path('games-view');
                });
            } else {
                $scope.submitted = true;
            }
        };

    }
]);
