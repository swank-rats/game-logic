'use strict';

angular.module('mean.websocket').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('websocket example page', {
      url: '/websocket/example',
      templateUrl: 'websocket/views/index.html'
    });
  }
]);
