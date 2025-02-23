'use strict';

/* States */
angular.module('GeolocationModule').config([
  '$stateProvider', 'DomainConfigProvider',
  function ($stateProvider, DomainConfigProvider) {
    var domainConfig = DomainConfigProvider.$get();

    // State Configurations
    $stateProvider

      .state('auth.geolocation', {
        abstract: true,
        url: '/geolocation',
        template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
        data: {
            requiresLexicographerPriviledge: true
        }
      })

      .state('auth.geolocation.list_geolocation', {
        page_title: `${domainConfig.siteDisplayName} Admin - Geolocation`,
        ncyBreadcrumb: {label: 'All Geolocations'},
        url: '/list',
        templateUrl: 'tmpls/geolocation/list.html',
        controller: 'GeolocationController'
      });
  }
]);