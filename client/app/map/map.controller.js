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

angular.module('quizApp').controller('MapCtrl', function($scope, leafletData, nominatim, wikipedia, $http, socket, Auth) {
      
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

      var formatSummaryData = function(summaryData) {
        var url = "http://es.wikipedia.org/wiki/" + summaryData.title;
        return "<strong><a target='_blank' href='" + url + "'>" + summaryData.title + "</a></strong><br>"+summaryData.extract;
      }

      leafletData.getMap('map').then(function(map) {

        L.Icon.Default.imagePath = './bower_components/leaflet/dist/images';
        L.AwesomeMarkers.imagePath = './bower_components/Leaflet.awesome-markers/dist/images';

        var questionIcon = L.AwesomeMarkers.icon({
          icon: 'glyphicon-question-sign',
          markerColor: 'red',
        });

        var wikipediaIcon = L.AwesomeMarkers.icon({
          icon: 'glyphicon-star',
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

        //wikipedia markers
        if(!$scope.isLoggedIn()){

          var lastMarker = $scope.Madrid;
          if($scope.listAddress.length > 0 ) {
            lastMarker = $scope.listAddress[$scope.listAddress.length-1];  
          }
          
          wikipedia.getGeodata(lastMarker.lat, lastMarker.lng).success(function(geodata){

            var markersWP = new L.FeatureGroup();
            
            geodata.query.geosearch.forEach(function(wPMarker){
              var latLng = L.latLng(wPMarker.lat, wPMarker.lon);
                  var marker = L.marker(latLng, {icon: wikipediaIcon});

                  wikipedia.getSummaryArticle(wPMarker.title).success(function(articleData) {
                    var summaryData = articleData.query.pages[wPMarker.pageid];
                    marker.bindPopup(formatSummaryData(summaryData)).openPopup();
                    markersWP.addLayer(marker);
                  }); 
            });
              
            map.addLayer(markersWP);

          });

        }  

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

          nominatim.searchAddress(form.search)
          .success(function(searchResults){ 
            $scope.searchResults = searchResults;
          });

          $scope.submitted = true;
          
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
                  nominatim.getAddressByLatLng(latLng)
                    .success(function(address) {
                       marker.bindPopup('<strong>' + address.road+' ' + address.house_number +'</strong><br>'+address.display_name).openPopup();
                       $scope.edit=true;
                    })
                    .error(function(err) {
                      console.log(err);
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
