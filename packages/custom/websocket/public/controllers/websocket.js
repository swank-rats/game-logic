'use strict';

angular.module('mean.websocket').controller('WebsocketController', ['$scope', 'Global', 'Websocket',
  function($scope, Global, Websocket) {
    $scope.global = Global;
    $scope.package = {
      name: 'websocket'
    };
  }
]);
