'use strict';

angular.module('mean.games').service('WebsocketUtil', [function() {

    return function($rootScope, $scope) {

        return {

            /**
             * Initializes the websocket
             */
            initWebsocket: function(username, form, wssUrl) {
                if (!$rootScope.websocket) {
                    var connection = new WebSocket(wssUrl);
                    $rootScope.websocket = connection;

                    connection.onopen = function() {
                        connection.send(JSON.stringify({
                            to: 'game',
                            cmd: 'init',
                            params: {
                                user: username,
                                form: form
                            }
                        }));
                    };

                    connection.onmessage = function(e) {
                        if (e.data.indexOf('{') > -1) {
                            var data = JSON.parse(e.data);
                            if (!!data.cmd) {
                                switch (data.cmd) {
                                    case 'changedStatus':
                                        $scope.$emit('statusChanged', data);
                                        break;
                                }
                            }
                        } else {
                            console.log('Server: ' + e.data);
                        }
                    };
                }
            },

            /**
             * Sends a message through the websocket
             * @param to
             * @param cmd
             * @param params
             */
            sendMessage: function(to, cmd, params) {
                if (!!$rootScope.websocket) {
                    $rootScope.websocket.send(JSON.stringify({
                        to: to,
                        cmd: cmd,
                        params: params
                    }));
                } else {
                    console.error('No websocket found!');
                }
            }
        };
    };
}]);
