'use strict';

angular.module('quizApp').config(function ($routeProvider) {

    $routeProvider.when('/', {
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

    

});
