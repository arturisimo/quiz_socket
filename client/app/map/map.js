'use strict';

angular.module('quizApp').config(function($routeProvider) {
    $routeProvider.when('/map', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });
