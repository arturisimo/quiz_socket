'use strict';

angular.module('quizApp').controller('QuizCtrl', function ($scope, $routeParams, $http, socket, $location, Auth) {
    $scope.quizes = [];
    $scope.quiz = {};

    console.log("QuizCtrl" + JSON.stringify($routeParams.search));

    if($routeParams.id){
      $http.get('/api/quizzes/'+$routeParams.id).success(function(quiz) {
        $scope.quiz = quiz;
        socket.syncUpdates('quiz', $scope.quiz);
      });
    } else {
      if(Auth.isLoggedIn()){
         $location.path( "/quiz-admin");
      }

      $http.get('/api/quizzes').success(function(quizes) {
        $scope.quizes = quizes;
         socket.syncUpdates('quizes', $scope.quizes);
      });
    }

    $scope.validateQuiz = function(form, quiz) {
      $scope.submitted = true;

       $scope.classFeedback="alert-danger";
       $scope.msg="no es correcto";
       $scope.respuesta=form.respuesta;

       if(quiz.respuesta == form.respuesta ) {
          $scope.msg="es correcto";
          $scope.classFeedback="alert-success";
       } 
    };

    $scope.addComment = function(formComment,quiz) {
      $scope.submitted = true;

       $scope.classFeedback="alert-danger";
      
       formComment.active=false;
       formComment.idQuiz=quiz._id;

        $http.post('/api/comments', formComment).success(function(comment) {
           quiz.comments.push(comment._id);
           $http.put('/api/quizzes/'+quiz._id, quiz).success(function(quiz2) {
            $scope.msgComment="El comentario se ha dado de alta correctamente";
            $scope.classFeedback="alert-success";
            $scope.comment={};
           }).error(function(error) {
             $scope.msgComment="Se ha producido los siguientes errores:";
             $scope.errors=error.errors;
             $scope.classFeedback="alert-danger";
          });
        }).error(function(error) {
           $scope.msgComment="Se ha producido los siguientes errores:";
           $scope.errors=error.errors;
           $scope.classFeedback="alert-danger";
        });       
    };
    
    $scope.controlLength = function(comentario){
        angular.element(document.querySelector('#commentLength')).text(250-comentario.length);        
    };
    

});

angular.module('quizApp').controller('QuizAdminCtrl', function ($scope, $routeParams, $http, socket, $location, Auth) {
    $scope.quizes = [];
    $scope.quiz = {};

    console.log("QuizAdminCtrl" + JSON.stringify($routeParams.search));

    if(!Auth.isLoggedIn()){
       $location.path( "/quizzes");
    }
   
    $http.get('/api/quizzes').success(function(quizes) {
        $scope.quizes = quizes;
        console.log(quizes);
        socket.syncUpdates('quizes', $scope.quizes);
    });
    
    $scope.toggleComment = function(quizId){
        angular.element(document.querySelector('#comments_'+quizId)).toggleClass('hide');
        var icon = angular.element(document.querySelector('#icon_'+quizId));
        if (icon.text() == '+'){
            icon.text("-");
        } else {
            icon.text("+");
        }
    };

    $scope.delete = function(quiz) {
        $http.delete('/api/quizzes/'+quiz._id);
    };
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('quiz');
    });

    $scope.activeComment = function(comment) {
        comment.active = !comment.active;
        $http.put('/api/comments/'+comment._id, comment).success(function() {
           $location.path( "/quiz-admin");
        });
    };

    $scope.deleteComment = function(comment) {
        $http.delete('/api/comments/'+comment._id).success(function() {
           $location.path( "/quiz-admin");
        });
    };

  });


angular.module('quizApp').controller('QuizEditCtrl', function ($scope, $routeParams, $http, socket, $location, Auth) {
    $scope.quiz = {};
    $scope.title = 'Nueva pregunta';
    $scope.msg = '';
    $scope.errors = [];
    $scope.temas = ["otro", "humanidades","ocio","ciencia","tecnologia","Geografía"];

    console.log("QuizEditCtrl" + JSON.stringify($routeParams.search));

    if(!Auth.isLoggedIn()){
       $location.path( "/login" );
    }

    if($routeParams.id){
      $http.get('/api/quizzes/'+$routeParams.id).success(function(quiz) {
        $scope.quiz = quiz;
        $scope.title = 'Modifica la pregunta #'+quiz.quizId;
      });
    }
  
    $scope.addQuiz = function(form) {
      $scope.submitted = true;
      $scope.classFeedback="alert-success";

      if(form._id){
        $http.put('/api/quizzes/'+form._id, form).success(function(quiz) {
          $scope.quiz = quiz;
          $scope.msg = 'La pregunta #'+quiz.quizId+' se ha modificado correctamente';
        }).error(function(error) {
           $scope.errors=error.errors;
        });
      }  else {
        $http.post('/api/quizzes',form).success(function(quiz) {
          $scope.quiz = {};
          $scope.submitted = false;
          $scope.msg = 'La pregunta se ha añadido correctamente';
        }).error(function(error){
           $scope.errors = error.errors;
        });
      } 

    };
});

angular.module('quizApp').controller('StatsCtrl', function ($scope, $routeParams, $http, $location, Auth) {

    $scope.title = 'Estadísticas';
    $scope.stats = {};

    if(!Auth.isLoggedIn()){
       $location.path( "/login" );
    }

    $http.get('/api/quizzes').success(function(quizes) {
        
        var num_comment = 0;
        var num_quiz_comment = 0;
        var num_quiz_nocomment = 0;

        quizes.forEach(function(quiz){
          if (quiz.comments.length > 0) {
            num_quiz_comment++;
            num_comment += quiz.comments ? quiz.comments.length : 0;
          } else {
            num_quiz_nocomment++;
          }
        });

        var num_quiz = quizes.length;
        var avg_comment_quiz = (num_comment / num_quiz).toFixed(2);

      $scope.stats = {num_quiz:num_quiz, num_comment:num_comment, num_quiz_comment:num_quiz_comment, num_quiz_nocomment:num_quiz_nocomment, avg_comment_quiz:avg_comment_quiz};

    });
    
  });


angular.module('quizApp').controller('QuizSearchCtrl', function ($scope, $routeParams, $http, $location, Auth) {

    $scope.title = 'Preguntas: "'+ $routeParams.search + "'";
    $scope.quizes = [];
    $scope.search = $routeParams.search;

    console.log("QuizSearchCtrl" + JSON.stringify($routeParams.search));

    if($routeParams.search){
      $http.get('/api/quizzes/search/'+$routeParams.search).success(function(quizes) {
        $scope.quizes = quizes;
      });
    }
});
