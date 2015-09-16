'use strict';

angular.module('quizApp').config(function($routeProvider) {
    $routeProvider.when('/map-admin', {
        templateUrl: 'app/map/map-admin.html',
        controller: 'MapCtrl'
    });
    $routeProvider.when('/map', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
    });
});
