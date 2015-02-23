'use strict';

angular.module('mean.games').controller('GamesClearController', ['$scope', 'Global', '$http',
    function($scope, Global, $http) {

        $scope.global = Global;

        $scope.hasAuthorization = function(game) {
            if (!game || !game.user) return false;
            return $scope.global.isAdmin || game.user._id === $scope.global.user._id;
        };

        $scope.init = function(){
            $http.get('/clear').
                success(function() {
                    console.log('removed games!');
                }).
                error(function() {
                    console.log('could not remove games!');
                });
        };
    }
]);
