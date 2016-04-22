'use strict';

angular.module('dashboardappApp').service('geolocationService', [
  '$http',
  function ($http) {
    this.load = function (query) {
      return $http.get('/v1/admin/geolocations');
    };
  }
]);