'use strict';

angular.module('mean.games').controller('GamesController', ['$scope', 'Global',
    function($scope, Global) {

        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

    }
]);
