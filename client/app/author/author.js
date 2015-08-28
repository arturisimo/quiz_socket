'use strict';

angular.module('quizApp').config(function ($routeProvider) {
    
    $routeProvider.when('/author', {
        templateUrl: 'app/author/author.html'
    });

});