'use strict';
angular.module('underscore', []).factory('_', function () {
  return window._;
});
angular.module('dashboardappApp', [
  'config',
  'ui.router',
  'ngAnimate',
  'ui.load',
  'ngSanitize',
  'ngStorage',
  'ngTagsInput',
  'ui.bootstrap',
  'ncy-angular-breadcrumb',
  'ngRetina',
  'toastr',
  'NgSwitchery',
  'textAngular',
  'angularFileUpload',
  'underscore',
  'angularUtils.directives.dirPagination'
])  /* Config Block */.config([
  '$provide',
  '$httpProvider',
  'ENV',
  function ($provide, $httpProvider, ENV) {
    // Intercept http calls.
    $provide.factory('MyHttpInterceptor', [
      '$localStorage',
      '$q',
      function ($localStorage, $q) {
        return {
          // On request success
          request: function (config) {
            if ($localStorage.token !== undefined) {
              $httpProvider.defaults.headers.common.Authorization = 'Basic ' + $localStorage.token;
            }
            if (/^\/v1\//.test(config.url)) {
              config.crossOrigin = true;
              // config.xhrFields || (config.xhrFields = { withCredentials: false });
              config.url = ENV.baseUrl + config.url;
            }
            // Return the config or wrap it in a promise if blank.
            return config || $q.when(config);
          },
          // On request failure
          requestError: function (rejection) {
            //console.log('request failure', rejection); // Contains the data about the error on the request.
            // Return the promise rejection.
            return $q.reject(rejection);
          },
          // On response success
          response: function (response) {
            if (/\/v1\//.test(response.config.url)) {
              return response || $q.when(response);
            }
            // Return the response or promise.
            return response || $q.when(response);
          },
          // On response failure
          responseError: function (rejection) {
            // Return the promise rejection.
            return $q.reject(rejection);
          }
        };
      }
    ]);
    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('MyHttpInterceptor');
  }
])  /* Breadcrumbs options */.config(function ($breadcrumbProvider) {
  $breadcrumbProvider.setOptions({
    prefixStateName: 'auth.home',
    templateUrl: 'tmpls/partials/breadcrumbs.html'
  });
})  /* bootstrap-ui tooltips */.config(function ($tooltipProvider) {
  $tooltipProvider.options({ appendToBody: true });
})  /* Prefix ng-storage with application name for new change's sakes */.config([
  '$localStorageProvider',
  function ($localStorageProvider) {
    $localStorageProvider.setKeyPrefix('Yoruba::Dictionary::App::v0.0.1-');
  }
])  /* Run Block */.run([
  '$rootScope',
  '$state',
  '$stateParams',
  '$localStorage',
  'toastr',
  function ($rootScope, $state, $stateParams, $localStorage, toastr) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    var is_logged_in = function () {
      if ($localStorage.isAuthenticated === true) {
        // read user info from $localStorage and set on $rootScope if it's not there 
        if (!$rootScope.logged_in_user) {
          $rootScope.logged_in_user = {
            username: $localStorage.username,
            email: $localStorage.email,
            id: $localStorage.id
          };
          $rootScope.isAuthenticated = true;
          $rootScope.isAdmin = $localStorage.role === 'admin';
          $rootScope.isLexicographer = $localStorage.role === 'lex_pro';
          $rootScope.isBasic = $localStorage.role === 'lex_basic';
          $rootScope.baseUrl = $localStorage.baseUrl;
        }
        return true;
      }
    };
    $rootScope.$on('$stateChangeSuccess', function () {
      // scroll view to top
      $('html, body').animate({ scrollTop: 0 }, 200);
      // fastclick (eliminate the 300ms delay between a physical tap and 
      // the firing of a click event on mobile browsers)
      FastClick.attach(document.body);
    });
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      var requiresLogin = toState.data.requiresLogin, requiresAdminPriviledge = toState.data.requiresAdminPriviledge, requiresLexicographerPriviledge = toState.data.requiresLexicographerPriviledge, requiresLogout = toState.data.requiresLogout;
      if (requiresLogin === true && !is_logged_in()) {
        event.preventDefault();
        $state.go('login');
        toastr.warning('You have to log in to continue...');
      } else if (requiresAdminPriviledge && !$rootScope.isAdmin) {
        event.preventDefault();
        $state.go('auth.home');
        toastr.warning('You are not authorised to view the requested resource');
      } else if (requiresLexicographerPriviledge && $rootScope.isBasic) {
        event.preventDefault();
        $state.go('auth.home');
        toastr.warning('You are not authorised to view the requested resource');
      } else if (requiresLogout === true && is_logged_in()) {
        event.preventDefault();
        $state.go('login');
      }
    });
    $rootScope.isTouchDevice = !!('ontouchstart' in window);
    $rootScope.isHighDensity = function () {
      return window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches || window.devicePixelRatio && window.devicePixelRatio > 1.3);
    };
    $rootScope.appVer = 'v1.0';
    // Main menu
    $rootScope.sideMenuAct = false;
    $rootScope.topMenuAct = true;
    $rootScope.fixedLayout = true;
  }
])  /* filters */
    // https://github.com/angular-ui/ui-utils
.filter('unique', [
  '$parse',
  function ($parse) {
    return function (items, filterOn) {
      if (filterOn === false) {
        return items;
      }
      if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
        var newItems = [], get = angular.isString(filterOn) ? $parse(filterOn) : function (item) {
            return item;
          };
        var extractValueToCompare = function (item) {
          return angular.isObject(item) ? get(item) : item;
        };
        angular.forEach(items, function (item) {
          var isDuplicate = false;
          for (var i = 0; i < newItems.length; i++) {
            if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            newItems.push(item);
          }
        });
        items = newItems;
      }
      return items;
    };
  }
]).factory('utils', function () {
  return {
    // Util for finding an object by its 'id' property among an array
    findById: function findById(a, id) {
      for (var i = 0; i < a.length; i++) {
        if (a[i].id === id) {
          return a[i];
        }
      }
      return null;
    }
  };
});