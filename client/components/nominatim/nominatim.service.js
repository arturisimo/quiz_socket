'use strict';

angular.module('quizApp').factory('nominatim', function nominatim($http) {
    
    return {

      searchAddress: function(search, callback) {
        return $http.get('http://nominatim.openstreetmap.org/search?format=json&q='+ search +'&addressdetails=1&accept-language=es') 
                    .success(function(data) { 
                      return data; 
                    }) 
                    .error(function(err) { 
                      console.log(err);
                      return err; 
                    });
      },
      getAddressByLatLng: function(latLng, callback) {
        return $http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+ latLng.lat+'&lon='+latLng.lng+'&addressdetails=1&accept-language=es')
                    .success(function(response) {
                       return { house_number: response.address.house_number, suburb: response.address.suburb, road: response.address.road, postcode: response.address.postcode,
                                country: response.address.country, country_code: response.address.country_code, city: response.address.city, 
                                lat:latLng.lat, lng: latLng.lng, display_name: response.display_name
                              };
                    })
                    .error(function(err) {
                      console.log(err);
                      return err;
                    });
      }

   };

});