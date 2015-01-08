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
                        if(data.status === 'ended'){
                            $scope.winner.username = data.winner;
                        }
                    }.bind(this));
                });

                // player was hit
                $scope.$on('hit', function(event, data) {
                    $scope.$apply(function() {
                        if($scope.player.user.username === data.username){
                            $scope.player.lifePoints = data.lifePoints;
                        }
                    }.bind(this));
                });
            };

        /*--------------------------------------------------------------------*/
        /* play page related
         /*--------------------------------------------------------------------*/

        /**
         * Hits a player
         * FIXME: Just for development
         */
        $scope.hit = function(index){
            GamesUtil.hitPlayer($scope.game, {player: index});
        };

        /**
         * starts the current game
         */
        $scope.start = function() {
            GamesUtil.startGame($scope.game);
        };

        /**
         * Resets values and redirects to highscores
         */
        $scope.end = function(){
            $location.path('/highscores');
            WebsocketUtil.close();
            $rootScope.websocket = null;
            $scope.player = {};
            $scope.game = {};
            $scope.winner={};
            console.log('Game ended - reset values!');
        };

        /**
         * Checks if user is registered for current ready game
         */
        $scope.init = function() {

            $scope.player = {};
            $scope.game = {};
            $scope.winner={};
            $scope.config = {
                server: '',
                maxLifePoints: '0'
            };

            bindCustomEvents();

            GamesUtil.fetchConfiguration().then(
                function() {
                    var response = GamesUtil.findCurrentGame(),
                        user = $scope.global.user,
                        game;

                    response.$promise.then(function(response) {
                        game = !!response[0] ? response[0] : null;
                        $scope.player = GamesUtil.getPlayerByUser(game, user);
                        $scope.game = game;

                        // when there is a game "full" and the user is a player of this game show everything
                        if (!!game && !!game.players && !!GamesUtil.isUserRegisteredForGame(game, user)) {
                            $scope.config.server = $rootScope.config.streamServer;
                            $scope.config.maxLifePoints = $rootScope.config.players.lifePoints;
                            WebsocketUtil.init(user.username, $scope.player.form, $rootScope.config.socketServer);
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
