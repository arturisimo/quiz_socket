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

angular.module('quizApp').controller('MapCtrl', function($scope, leafletData, $http, socket) {
      
      //$scope.description = "Descripción"
      $scope.listAddress = [];

      $http.get('/api/maps').success(function(listAddress) {
        $scope.listAddress = listAddress;
      });

      $scope.deleteAddress = function(address){
          $http.delete('/api/maps/'+address._id).success(function() {
            var index  = $scope.listAddress.indexOf(address);
            $scope.listAddress.splice(index,1);
            socket.syncUpdates('listAddress', $scope.listAddress);
          }).error(function(error){
              console.log(error);
             $scope.errors = error.errors;
          });
      };

      $scope.editAddress = function(address){
          console.log('editAddress');
          $scope.listAddress.forEach(function(address){
            address.edit = false;
          });

          address.edit = true;
      };
      $scope.noEditAddress = function(address){
          console.log('noeditAddress');
          address.edit = false;
      };
      
      angular.extend($scope, {
           Madrid: {
              lat: 40.4085123,
              lng: -3.700907700000016,
              zoom: 15
           }
      });

      leafletData.getMap('map').then(function(map) {

            map.on('click', function(e) {
                console.log('edit>'+$scope.edit);
                if($scope.edit) {
                  //todo delete prev marker
                } else {
                var latLng = e.latlng;
                map.setView(latLng); //re-centrar mapa
                
                var marker = L.marker(latLng);
                marker.addTo(map);

                //obtener address con nominatin
                $http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+ latLng.lat+'&lon='+latLng.lng+'&addressdetails=1')
                  .success(function(response) {
                     console.log(response);
                     $scope.address = response.address;
                     marker.bindPopup('<strong>'+$scope.address.road+' ' + $scope.address.house_number +'</strong><br>'+response.display_name).openPopup();
                     $scope.edit=true;
                  })
                  .error(function(data, status, headers, config) {
                    console.log("error");
                });

                $scope.deleteMarker = function(){
                    map.removeLayer(marker);
                    $scope.edit=false;
                };

                $scope.saveAddress = function(form, address){
                    address.description = form.description.$modelValue;
                    
                    $http.post('/api/maps', address).success(function(address) {
                      //recargar la lista de address
                      $scope.listAddress.push(address);
                      socket.syncUpdates('listAddress', $scope.listAddress); 
                      $scope.edit=false;
                    }).error(function(error){
                       console.log(error);
                       $scope.errors = error.errors;
                    });
                }
              };

          });

    });
});
