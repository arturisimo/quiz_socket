/*
 * https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=5000&gscoord=40.741934%7C-74.004897&gslimit=30&format=json&callback=JSON_CALLBACK
 * https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Stack%20Overflow
 */
angular.module('quizApp').factory('wikipedia', ['$http', function wikipedia($http) {

	return {
		getGeodata:function(lat,lng){
			return $http.jsonp('https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=5000&gscoord='+lat+'%7C'+lng+'&gslimit=30&format=json&callback=JSON_CALLBACK') 
		    .success(function(data) { 
		      return data; 
		    }) 
		    .error(function(err) { 
		      console.log(err);
		      return err; 
		    });
		},
		getSummaryArticle: function(title){
			return $http.jsonp('https://es.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&titles='+title+'&callback=JSON_CALLBACK') 
		    .success(function(data) { 
		      return data; 
		    }) 
		    .error(function(err) { 
		      console.log(err);
		      return err; 
		    });	
		}	    
	};
}]);