'use strict';

angular.module('mean.games').service('WebsocketUtil', [function() {

    return function($rootScope, $scope) {

        return {

            /**
             * Initializes the websocket
             */
            init: function(username, form, wssUrl) {
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
                        // TODO try catch?
                        if (e.data.indexOf('{') > -1) {
                            var data = JSON.parse(e.data);
                            if (!!data.cmd) {
                                switch (data.cmd) {
                                    case 'changedStatus':
                                        $scope.$emit('statusChanged', data);
                                        break;
                                    case 'hit':
                                        $scope.$emit('hit', data.params);
                                        break;
                                    case 'connectionLost':
                                        $scope.$emit('connectionLost');
                                        break;
                                }
                            }
                        } else {
                            console.log('Server: ' + e.data);
                        }
                    };

                    connection.onerror = function(error){
                        console.error('Websocket error:',error);
                        console.log('Trying to restart websocket...');
                        this.init(username, form, wssUrl);
                    }.bind(this);

                    connection.onclose = function(){
                        console.log('Websocket closed!');
                    };
                }
            },

            /**
             * Closes current websocket connection
             */
            close: function(){
                if(!!$rootScope.websocket) {
                    $rootScope.websocket.close();
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
