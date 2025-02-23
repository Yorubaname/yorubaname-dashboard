'use strict';
/* Controllers */
angular.module('AuthModule').controller('AuthController', [
  '$scope',
  '$window',
  'AuthService',
  function ($scope, $window, authService) {
    var domain = $window.location.hostname;

    if (domain.includes("igboname")) {
      $scope.siteAltText = "Igbo Names";
      $scope.topBarColor = "igbo-theme";
    } else {
      $scope.siteAltText = "Yoruba Names";
      $scope.topBarColor = "yoruba-theme";
    }

    $scope.login = {};
    $scope.submit = function () {
      return authService.authenticate($scope.login);
    };
    $scope.logout = function () {
      return authService.logout();
    };
  }
]);