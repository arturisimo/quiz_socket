'use strict';

angular.module('quizApp')
  .config(function($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  });
