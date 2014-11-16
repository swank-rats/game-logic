//'use strict';
//
//angular.module('mean.games', []).directive('keyEvents', [
//    '$document',
//    '$rootScope',
//    function($document, $rootScope) {
//
//        return {
//
//            link: function() {
//                $document.bind('keypress', function(e) {
//                    console.log('Got keypress:', e.which);
//                    $rootScope.$broadcast('keypress', e);
//                    $rootScope.$broadcast('keypress:' + e.which, e);
//                });
//            }
//        };
//    }
//]);
