'use strict';

angular.module('mean.games').controller('GamesController', ['$scope', '$stateParams', '$location', 'Global', 'Games',
    function($scope, $stateParams, $location, Global, Games) {
        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

        $scope.find = function() {
            Games.query(function(Games) {
                $scope.games = Games;
            });
        };

        $scope.findOne = function() {
            Games.get({
                gamesId: $stateParams.gamesId
            }, function(game) {
                $scope.game = game;
            });
        };
    }
]);
