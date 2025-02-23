'use strict';
/* States */
angular.module('dashboardappApp').config([
  '$stateProvider',
  '$urlRouterProvider',
  'DomainConfigProvider',
  function ($stateProvider, $urlRouterProvider, DomainConfigProvider) {

    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
    $urlRouterProvider.when('/home', '/').otherwise('/login');

    var domainConfig = DomainConfigProvider.$get();
    // State Configurations
    $stateProvider

      // Errors
      .state('error', {
        url: '/error',
        abstract: true,
        template: '<div ui-view autoscroll="false" class="mainView-animate"></div>'
      })

      // Errors > 404
      .state('error.404', {
        page_title: `${domainConfig.siteDisplayName} - Admin - Error 404`,
        url: '/404',
        templateUrl: 'tmpls/error.404.html'
      });
  }

]);