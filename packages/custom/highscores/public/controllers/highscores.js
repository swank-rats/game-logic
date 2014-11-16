'use strict';

angular.module('mean.highscores').controller('HighscoresController', ['$scope', '$stateParams', '$location', 'Global', 'Highscores',
    function($scope, $stateParams, $location, Global, Highscores) {
        $scope.global = Global;

        $scope.hasAuthorization = function(highscore) {
            if (!highscore || !highscore.user) return false;
            return $scope.global.isAdmin || highscore.user._id === $scope.global.user._id;
        };

        $scope.find = function() {
            Highscores.query(function(Highscores) {
                $scope.highscores = Highscores;
            });
        };
    }
]);
