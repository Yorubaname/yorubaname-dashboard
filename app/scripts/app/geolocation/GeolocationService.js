'use strict';

angular.module('dashboardappApp').service('geolocationService', [
  '$http',
  function ($http) {
    var baseUrl = '/v1/geolocations';

    let geolocations = null;

    this.load = function (reload) {
      if (!geolocations || reload) {
        // Replace with your API endpoint or data source
        return $http.get(baseUrl).then(function (response) {
          geolocations = response.data;
          return geolocations;
        });
      } else {
        return {
          then: function (callback) {
            callback(geolocations);
          }
        };
      }
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