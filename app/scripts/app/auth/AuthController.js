'use strict';
/* Controllers */
angular.module('AuthModule').controller('AuthController', [
  '$scope',
  'AuthService',
  function ($scope, authService) {

    $scope.login = {};
    $scope.submit = function () {
      return authService.authenticate($scope.login);
    };
    $scope.logout = function () {
      return authService.logout();
    };
  }
]);