'use strict';

angular.module('dashboardappApp').service('geolocationService', [
  '$http',
  function ($http) {
    this.load = function () {
      return $http.get('/v1/geolocations');
    };
  }
]);