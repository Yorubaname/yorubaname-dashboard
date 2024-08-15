'use strict';

angular.module('GeolocationModule')
    .controller('GeolocationController', [
        '$scope',
        '$modal',
        'toastr',
        'geolocationService',
        function ($scope, $modal, toastr, GeoLocationService) {
            $scope.geolocations = [];

            // Load all geolocations
            $scope.loadGeoLocations = function () {
                GeoLocationService.load(true).then(function (data) {
                    $scope.geolocations = data;
                });
            };

            // Open the modal to add a new geolocation
            $scope.openAddGeoLocationModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'tmpls/geolocation/partials/addGeoLocationModal.html',
                    controller: 'AddGeoLocationModalController'
                });

                modalInstance.result
                .then(function (newGeoLocation) {
                    $scope.loadGeoLocations();
                    toastr.success(`Geolocation '${newGeoLocation.place}' was created successfully.`);
                })
                .catch(function(error){
                    toastr.error(error.data.message);
                });
            };

            // Delete a geolocation
            $scope.deleteGeoLocation = function (id, place, index) {
                GeoLocationService.delete(id, place)
                    .then(function (data) {
                        $scope.loadGeoLocations();
                        toastr.success(data.data.message);
                    })
                    .catch(function (error) {
                        toastr.error(error.data.message);
                    });
            };

            // Initialize the data
            $scope.loadGeoLocations();
        }])
    .controller('AddGeoLocationModalController', [
        '$scope',
        'toastr',
        '$modalInstance',
        'geolocationService',
        function ($scope, toastr, $modalInstance, GeoLocationService) {
            $scope.newGeoLocation = {};

            $scope.addGeoLocation = function () {
                if ($scope.newGeoLocation.place && $scope.newGeoLocation.region) {
                    GeoLocationService.add($scope.newGeoLocation)
                        .then(function () {
                            $modalInstance.close($scope.newGeoLocation);
                        })
                        .catch(function(error){
                            toastr.error(error.data.message);
                        });
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
