'use strict';

angular.module('mean.games').controller('GamesPlayController', ['$scope', '$stateParams', '$location', 'Global', 'Games', '$rootScope', '$http', '$q', 'GamesUtil',
    function($scope, $stateParams, $location, Global, Games, $rootScope, $http, $q, gamesUtil) {

        var pressedKeys = [],
            Util = gamesUtil($rootScope, Games, $http, $q, $scope);

        /*--------------------------------------------------------------------*/
        /* play page related
        /*--------------------------------------------------------------------*/

        /**
         * Checks if user is registered for current ready game
         */
        $scope.init = function() {

            Util.fetchConfiguration().then(
                function() {
                    var response = Util.findReadyGame(),
                        user = $scope.global.user,
                        game;

                    response.$promise.then(function(response) {
                        game = !!response[0] ? response[0] : null;
                        // when there is a game ready and the user is a player show everything
                        if (!!game && !!game.players && !!Util.isUserRegisteredForGame(game, user)) {
                            $scope.server = $rootScope.config.streamServer;
                            Util.initWebsocket();
                        } else {
                            // TODO show game without websocket and controlls
                            $location.path('games');
                        }
                    });
                },

                function(data, status, headers) {
                    console.error({
                        data: data,
                        status: status,
                        headers: headers
                    });
                }
            );
        };

        /**
         * Eventlistener for keypresses
         * @param event
         */
        $scope.keyDownAction = function(event) {
            if (!!$rootScope.websocket && !!event.which) {
                var cmd = Util.getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) === -1) {
                    pressedKeys.push(cmd);
                    Util.sendMessage(
                        'game',
                        'move',
                        {
                            user: $scope.global.user.username,
                            started: true
                        },
                        cmd
                    );
                }
            }
        };

        /**
         * Eventlistener for keypresses
         * @param event
         */
        $scope.keyUpAction = function(event) {
            if (!!$rootScope.websocket && !!event.which) {
                var cmd = Util.getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) > -1) {
                    pressedKeys.splice(pressedKeys.indexOf(cmd), 1);
                    Util.sendMessage(
                        'game',
                        'move',
                        {
                            user: $scope.global.user.username,
                            started: false
                        },
                        cmd
                    );
                }
            }
        };

    }
]);
