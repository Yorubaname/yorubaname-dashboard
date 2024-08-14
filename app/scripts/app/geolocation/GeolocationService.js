'use strict';

angular.module('dashboardappApp').service('geolocationService', [
  '$http',
  function ($http) {
    var baseUrl = '/v1/geolocations';
    this.load = function () {
      return $http.get(baseUrl);
    };

    // Add a new geolocation
    this.add = function (geolocation) {
      return $http.post(baseUrl, geolocation);
    };

    // Delete a geolocation by ID
    this.delete = function (id, place) {
      return $http.delete(`${baseUrl}/${id}/${place}`);
    };
  }
]);