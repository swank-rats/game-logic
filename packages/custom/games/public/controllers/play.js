'use strict';

angular.module('mean.games').controller('GamesPlayController', ['$scope', '$stateParams', '$location', 'Global', 'Games', '$rootScope', '$http', '$q', 'GamesUtil',
    function($scope, $stateParams, $location, Global, Games, $rootScope, $http, $q, gamesUtil) {

        var pressedKeys = [],
            Util = gamesUtil($rootScope, Games, $http, $q, $scope),

            bindCustomEvents = function() {

                // status of a game changes and different html has to be shown
                $scope.$on('statusChanged', function(event, data){
                    console.log('gamestate: '+ $scope.game.status);
                    $scope.game.status = data.status;
                    $scope.$apply();
                    console.log('gamestate: '+ $scope.game.status);
                }.bind(this));
            };

        /*--------------------------------------------------------------------*/
        /* play page related
         /*--------------------------------------------------------------------*/

        /**
         * Checks if user is registered for current ready game
         */
        $scope.init = function() {

            $scope.game = {};
            $scope.config = {
                server: ''
            };
            bindCustomEvents();

            Util.fetchConfiguration().then(
                function() {
                    var response = Util.findCurrentGame(),
                        user = $scope.global.user,
                        game, form;

                    response.$promise.then(function(response) {
                        game = !!response[0] ? response[0] : null;
                        form = Util.getFormForUserInGame(game, user);
                        $scope.game = game;

                        // when there is a game "full" and the user is a player of this game show everything
                        if (!!game && !!game.players && !!Util.isUserRegisteredForGame(game, user)) {
                            $scope.config.server = $rootScope.config.streamServer;
                            Util.initWebsocket(user.username, form, $rootScope.config.socketServer);
                        } else { // when a game has started
                            // TODO implement watch only mode?
                            $location.path('games');
                        }
                    }.bind(this));
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
         * Eventlistener for key-press
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
                        cmd === 'shoot' ? 'shoot' : 'move',
                        {
                            user: $scope.global.user.username,
                            started: true,
                            cmd: cmd
                        }
                    );
                }
            }
        };

        /**
         * Eventlistener for key-release
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
                        cmd === 'shoot' ? 'shoot' : 'move',
                        {
                            user: $scope.global.user.username,
                            started: false
                        }
                    );
                }
            }
        };
    }
]);
