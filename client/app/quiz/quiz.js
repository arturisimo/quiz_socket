'use strict';

angular.module('quizApp').config(function ($routeProvider) {

    $routeProvider.when('/quizzes/add', {
        templateUrl: 'app/quiz/add.html',
        controller: 'QuizEditCtrl'
    });
    
    $routeProvider.when('/quizzes', {
        templateUrl: 'app/quiz/quizzes.html',
        controller: 'QuizCtrl'
    });
    
    $routeProvider.when('/search-quiz', {
        templateUrl: 'app/quiz/quizzes.html',
        controller: 'QuizSearchCtrl'
    });

    $routeProvider.when('/quizzes/:id', {
        templateUrl: 'app/quiz/quiz.html',
        controller: 'QuizCtrl'
    });

    $routeProvider.when('/quiz-admin', {
        templateUrl: 'app/quiz/list-admin.html',
        controller: 'QuizAdminCtrl'
    });

    $routeProvider.when('/quizzes/:id/edit', {
        templateUrl: 'app/quiz/add.html',
        controller: 'QuizEditCtrl'
    });

    $routeProvider.when('/stadistics', {
        templateUrl: 'app/quiz/stats.html',
        controller: 'StatsCtrl'
    });
    

});
