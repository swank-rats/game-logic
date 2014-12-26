'use strict';

angular.module('mean.games').controller('GamesPlayController', ['$scope', '$location', 'Global', 'Games', '$rootScope', '$http', '$q', 'GamesUtil', 'WebsocketUtil',
    function($scope, $location, Global, Games, $rootScope, $http, $q, gamesUtil, websocketUtil) {

        var pressedKeys = [],
            GamesUtil = gamesUtil($rootScope, Games, $http, $q, $scope),
            WebsocketUtil = websocketUtil($rootScope, $scope),

            bindCustomEvents = function() {

                // status of a game changes and different html has to be shown
                $scope.$on('statusChanged', function(event, data) {

                    // http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                    $scope.$apply(function() {
                        $scope.game.status = data.status;
                    }.bind(this));
                });
            };

        /*--------------------------------------------------------------------*/
        /* play page related
         /*--------------------------------------------------------------------*/

        /**
         * starts the current game
         */
        $scope.start = function() {
            GamesUtil.startGame($scope.game);
        };

        /**
         * Checks if user is registered for current ready game
         */
        $scope.init = function() {

            $scope.game = {};
            $scope.config = {
                server: ''
            };

            bindCustomEvents();

            GamesUtil.fetchConfiguration().then(
                function() {
                    var response = GamesUtil.findCurrentGame(),
                        user = $scope.global.user,
                        game, form;

                    response.$promise.then(function(response) {
                        game = !!response[0] ? response[0] : null;
                        form = GamesUtil.getFormForUserInGame(game, user);
                        $scope.game = game;

                        // when there is a game "full" and the user is a player of this game show everything
                        if (!!game && !!game.players && !!GamesUtil.isUserRegisteredForGame(game, user)) {
                            $scope.config.server = $rootScope.config.streamServer;
                            WebsocketUtil.initWebsocket(user.username, form, $rootScope.config.socketServer);
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
                var cmd = GamesUtil.getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) === -1) {
                    pressedKeys.push(cmd);
                    WebsocketUtil.sendMessage(
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
                var cmd = GamesUtil.getCommandFromKeyEvent(event.which);

                // event triggered the first time
                if (!!cmd && pressedKeys.indexOf(cmd) > -1) {
                    pressedKeys.splice(pressedKeys.indexOf(cmd), 1);
                    WebsocketUtil.sendMessage(
                        'game',
                        cmd === 'shoot' ? 'shoot' : 'move',
                        {
                            user: $scope.global.user.username,
                            started: false,
                            cmd: cmd
                        }
                    );
                }
            }
        };
    }
]);
