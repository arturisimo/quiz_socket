'use strict';

angular.module('quizApp').controller('QuizCtrl', function ($scope, $routeParams, $http, socket, $location, Auth) {
    $scope.quizes = [];
    $scope.quiz = {};

    if($routeParams.id){
      $http.get('/api/quizzes/'+$routeParams.id).success(function(quiz) {
        $scope.quiz = quiz;
        socket.syncUpdates('quiz', $scope.quiz);
      });
    } else {
      if(Auth.isLoggedIn()){
         $location.path( '/quiz-admin');
      }

      $http.get('/api/quizzes').success(function(quizes) {
        $scope.quizes = quizes;
         socket.syncUpdates('quizes', $scope.quizes);
      });
    }

    $scope.validateQuiz = function(form, quiz) {
      $scope.submitted = true;
      
      if(quiz.respuesta.toLowerCase() == form.respuesta.toLowerCase() ) {
          $scope.quizFB={'ok':true, 'id': quiz.quizId, 'respuesta': form.respuesta};
      } else {
          $scope.quizFB={'ok':false, 'id': quiz.quizId, 'respuesta': form.respuesta};
      }

      form.respuesta='';

    };

    $scope.repeatQuiz = function(form) {
       $scope.submitted = false;
       form.respuesta = '';
       $scope.quizFB = undefined;
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
            $scope.formComment = {};
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

function getStats(quizes) {
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

      var stats = [ quizes.length + ' preguntas',
                       num_comment + ' comentarios',
                       (num_comment / quizes.length).toFixed(2) + ' comentarios por pregunta',
                       num_quiz_nocomment + ' preguntas sin comentarios',
                       num_quiz_comment + ' preguntas con comentarios'
                     ];
      return stats;               
  }

angular.module('quizApp').controller('QuizAdminCtrl', function ($scope, $routeParams, $http, socket, $location, Auth) {
    $scope.quizes = [];
    $scope.quiz = {};
    $scope.stats = [];
    $scope.temas = ["otro", "humanidades","ocio","ciencia","tecnologia","Geografía"];

    if(!Auth.isLoggedIn()){
       $location.path( "/quizzes");
    }

    $http.get('/api/quizzes').success(function(quizes) {
        $scope.quizes = quizes;
        $scope.stats = getStats(quizes);
    });

    $scope.toggleComment = function(quizId){
        angular.element(document.querySelector('#comments_'+quizId)).toggleClass('hide');
    };

    $scope.showAddForm = function(){
        angular.element(document.querySelector('#add-quiz')).toggleClass('hide');
    };

    $scope.showStats = function(){
        angular.element(document.querySelector('#stats-quiz')).toggleClass('hide');
    };

    $scope.editQuiz = function(quiz){
        $scope.edit = {edit:true, quizId:quiz.quizId};
        angular.element(document.querySelectorAll('.comments')).addClass('hide');
    };
    

    $scope.delete = function(quiz) {
        $http.delete('/api/quizzes/'+ quiz._id).success(function() {
          var index  = $scope.quizes.indexOf(quiz);
          $scope.quizes.splice(index,1);
          socket.syncUpdates('quizes', $scope.quizes);
          $scope.stats = getStats($scope.quizes)
          socket.syncUpdates('stats', $scope.stats);
        });
    };

    $scope.activeComment = function(comment) {
        comment.active = !comment.active;
        $http.put('/api/comments/'+comment._id, comment).success(function() {
           $location.path( "/quiz-admin");
        });
    };

    $scope.deleteComment = function(comment, quiz) {
        $http.delete('/api/comments/'+comment._id).success(function() {
           var index = quiz.comments.indexOf(comment);
           quiz.comments.splice(index,1);
           index = $scope.quizes.indexOf(quiz);
           $scope.quizes[index]=quiz;
           socket.syncUpdates('quizes', $scope.quizes);
           $scope.stats = getStats($scope.quizes)
           socket.syncUpdates('stats', $scope.stats);
        });
    };

    $scope.addQuiz = function(form) {
      $scope.submitted = true;

      $http.post('/api/quizzes',form).success(function(quiz) {
        $scope.quiz = {};
        $scope.submitted = false;
        $scope.quizes.push(quiz);
        socket.syncUpdates('quizes', $scope.quizes);
        $scope.stats = getStats($scope.quizes)
        socket.syncUpdates('stats', $scope.stats);
      }).error(function(error){
         $scope.errors = error.errors;
      });
    
    };

    $scope.saveEditQuiz = function(form) {
      $scope.submitted = true;
      
      $http.put('/api/quizzes/'+form._id, form).success(function(quiz) {
        $scope.quiz = quiz;
        $scope.edit= undefined;
      }).error(function(error) {
         $scope.errors=error.errors;
      });
    }

  });



angular.module('quizApp').controller('QuizSearchCtrl', function ($scope, $routeParams, $http, $location, Auth) {

    $scope.title = 'Preguntas: "'+ $routeParams.search + "'";
    $scope.quizes = [];
    $scope.search = $routeParams.search;

    if($routeParams.search){
      $http.get('/api/quizzes/search/'+$routeParams.search).success(function(quizes) {
        $scope.quizes = quizes;
      });
    }
});
