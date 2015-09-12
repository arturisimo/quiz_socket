'use strict';

angular.module('quizApp').controller('NavbarCtrl', function ($scope, $location, Auth) {
    
    if(Auth.isLoggedIn()) {
      
      $scope.menu = [{ 'title': 'Inicio',
                       'link': '/quiz-admin'
                     }];
    } else {

      $scope.menu = [{ 'title': 'Inicio',
                      'link': '/'
                    },
                    { 'title': 'Mapas',
                      'link': '/map'
                    }];
    }

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    if($scope.search){
        angular.element(document.querySelector('#li_search_quiz')).removeClass('hide');
    }

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.searchQuiz = function(){
        if(angular.element(document.querySelector('#search_input')).val()!=''){
            angular.element(document.querySelector('#form_search_quiz')).submit();
        } else {
          angular.element(document.querySelector('#li_search_quiz')).toggleClass('hide');
        }
        
    };

  });