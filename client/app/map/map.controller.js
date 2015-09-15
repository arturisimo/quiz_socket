'use strict';


/*
 * TODO: eliminar el marcador si haces doble click
 *       si no guardas quitar el marcador
 *       click address > popup marcador 
 *       actualizar dinaminamente la descripcion en el popup marcador
 *       no mostrar undefined
 *       si road vacio sacarlo > bus_stop/pedestrian ??
 *
 */

angular.module('quizApp').controller('MapCtrl', function($scope, leafletData, $http, socket, Auth) {
      
      $scope.listAddress = [];
      var markers = [];

      $scope.isLoggedIn = Auth.isLoggedIn;

      angular.extend($scope, {
           Madrid: {
              lat: 40.395684,
              lng: -3.666904,
              zoom: 15
           }
      });

      leafletData.getMap('map').then(function(map) {

        var questionIcon = L.AwesomeMarkers.icon({
          icon: 'glyphicon-question-sign',
          markerColor: 'red',
        });
        
        $http.get('/api/maps').success(function(listAddress) {

          $scope.listAddress = listAddress;

          markers = new L.FeatureGroup();

          listAddress.forEach(function(address, i){         
            var latLng = L.latLng(address.lat, address.lng);
            var marker = L.marker(latLng);
            marker.bindPopup('<strong>'+address.road+' ' + address.house_number +'</strong><br>'+address.description).openPopup();
            markers.addLayer(marker);
            if(i==listAddress.length-1){
              map.setView(latLng);
            }
          });
          map.addLayer(markers);

        });

        $scope.deleteAddress = function(address){
            $http.delete('/api/maps/'+address._id).success(function() {
              var index  = $scope.listAddress.indexOf(address);
              $scope.listAddress.splice(index,1);
              socket.syncUpdates('listAddress', $scope.listAddress);
              
              map.removeLayer(markers);

              markers = new L.FeatureGroup();

              $scope.listAddress.forEach(function(address, i){         
                var latLng = L.latLng(address.lat, address.lng);
                var marker = L.marker(latLng);
                marker.bindPopup('<strong>'+address.road+' ' + address.house_number +'</strong><br>'+address.description).openPopup();
                markers.addLayer(marker);
                if(i==$scope.listAddress.length-1){
                  map.setView(latLng);
                }
              });
              map.addLayer(markers);

            }).error(function(error){
                console.log(error);
               $scope.errors = error.errors;
            });
        };

        $scope.saveEditAddress = function(form, address){

          address.description = form.description.$modelValue;

          $http.put('/api/maps/'+address._id, address).success(function(address) {
            socket.syncUpdates('listAddress', $scope.listAddress); 
            address.edit = false;
          }).error(function(error){
             console.log(error);
             $scope.errors = error.errors;
          });

        };

        $scope.editAddress = function(address){
            $scope.listAddress.forEach(function(address){
              address.edit = false;
            });
            address.edit = true;
        };

        $scope.noEditAddress = function(address){
            address.edit = false;
        };
      
        $scope.searchAddress = function(form){
          
          $scope.searchResults = [];
          $scope.submitted = true;
          
          $http.get('http://nominatim.openstreetmap.org/search?format=json&q='+ form.search +'&addressdetails=1&accept-language=es')
              .success(function(response) {
                  response.forEach(function(searchResult){
                    $scope.searchResults.push(searchResult);
                  });
              })
              .error(function(data, status, headers, config) {
                console.log("error");
            });

        };

        $scope.selectAddress = function(resultSearch){
         
            var latLng = L.latLng(Number(resultSearch.lat), Number(resultSearch.lon));

            $scope.submitted = false;

            map.setView(latLng);

            var marker = L.marker(latLng, {icon: questionIcon});
            
            marker.bindPopup('<strong>'+resultSearch.address.road+' ' + resultSearch.address.house_number +'</strong><br>'+resultSearch.display_name).openPopup();
            
            markers.addLayer(marker);

            $scope.edit = true;
            $scope.address = resultSearch.address;

            $scope.address.lat = resultSearch.lat;
            $scope.address.lng = resultSearch.lon;

            $scope.deleteMarker = function(){
                map.removeLayer(markers);
                map.addLayer(markers);
                $scope.edit=false;
            };
            
        };

        $scope.openPopup = function(address){

          var latLng = L.latLng(address.lat, address.lng);
          map.setView(latLng);
          
          var marker = L.marker(latLng);
          marker.addTo(map);
          marker.bindPopup('<strong>'+address.road+' ' + address.house_number +'</strong><br>'+address.description).openPopup();
        };

        $scope.saveAddress = function(form, address){
                                    
          address.description = form.description.$modelValue;
          
          $http.post('/api/maps', address).success(function(address) {
            
            $scope.listAddress.push(address);
            socket.syncUpdates('listAddress', $scope.listAddress);

            map.removeLayer(markers);
            
            markers = new L.FeatureGroup();

            $scope.listAddress.forEach(function(address, i){         
              var latLng = L.latLng(address.lat, address.lng);
              var marker = L.marker(latLng);
              marker.bindPopup('<strong>'+address.road+' ' + address.house_number +'</strong><br>'+address.description).openPopup();
              markers.addLayer(marker);
              if(i==$scope.listAddress.length-1){
                map.setView(latLng);
              }
            });

            map.addLayer(markers);
            
            $scope.edit = false;
            $scope.searchResults = [];
            $scope.formSearch = [];

          }).error(function(error){
             console.log(error);
             $scope.errors = error.errors;
          });
          
        };

        if(Auth.isLoggedIn()){

            map.on('click', function(e) {
                if($scope.edit) {
                  //todo delete prev marker
                } else {
                  var latLng = e.latlng;
                  map.setView(latLng); //re-centrar mapa

                  var questionIcon = L.AwesomeMarkers.icon({
                    icon: 'glyphicon-question-sign',
                    markerColor: 'red'
                  });
                  
                  var marker = L.marker(latLng, {icon: questionIcon});
                  markers.addLayer(marker);

                  //obtener address con nominatin
                  $http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+ latLng.lat+'&lon='+latLng.lng+'&addressdetails=1&accept-language=es')
                    .success(function(response) {
                       $scope.address = { house_number: response.address.house_number, suburb: response.address.suburb, road: response.address.road, postcode: response.address.postcode,
                                          country: response.address.country, country_code: response.address.country_code, city: response.address.city, 
                                          lat:latLng.lat, lng: latLng.lng
                                        };
                       marker.bindPopup('<strong>'+response.address.road+' ' + response.address.house_number +'</strong><br>'+response.display_name).openPopup();
                       $scope.edit=true;
                    })
                    .error(function(data, status, headers, config) {
                      console.log("error");
                    });
                  }

                  $scope.deleteMarker = function(){
                    map.removeLayer(marker);
                    $scope.edit=false;
                  };
            });
        }

    });  
});
