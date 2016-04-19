/* Authentication API Endpoint Service, Extension for API requests for Signing In, Out, and Session validation. Adapted from code base */

angular.module("dashboardappApp")
    .service('authService', ['baseService', 'usersService', '$localStorage', '$state', '$rootScope', '$timeout', 'toastr', 'ENV', function(api, usersApi, $localStorage, $state, $rootScope, $timeout, toastr, ENV){

    this.getUser = function(callback) {
      return api.get("/v1/auth/user").then(function(response) {
          return response
      })
    }

    // Authenticates clients.
    // authData is the base64 encoding of username and password
    // on authentication the $rootScope and $cookie is updated as necessary
    this.authenticate = function(authData) {
        // encode authData to base64 here, instead
        token = btoa(authData.email + ":" + authData.password)
        
        return api.authenticate(token).success(function(response) {
            $localStorage.isAuthenticated = true;
            $localStorage.id = response.id;
            $localStorage.username = response.username;
            $localStorage.email = authData.email;
            $localStorage.token = token;
            $localStorage.baseUrl = ENV.baseUrl;

            response.roles.some(function(role) {
                // Check ROLE_ADMIN first, since it supercedes all
                if (role === "ROLE_ADMIN") {
                    $localStorage.role = "admin";
                    return true
                }
                else if (role === "ROLE_PRO_LEXICOGRAPHER") {
                    $localStorage.role = "lex_pro";
                    return true
                }
                else if (role === "ROLE_BASIC_LEXICOGRAPHER") {
                    $localStorage.role = "lex_basic";
                    return true
                }
            })
            
            $rootScope.msg = {}
            $timeout(function(){
              $state.go('auth.home')
              toastr.success( "Hey " + $localStorage.username + ", you are now successfully logged in.", 'Login Successful!')
            }, 200)
        }).error(function(response) {
            toastr.error(response.message, 'Sign In Error')
        })
    }

    // Log out function
    this.logout = function(){
      delete $localStorage.isAuthenticated;
      delete $localStorage.role;
      delete $localStorage.username;
      delete $localStorage.email;
      delete $localStorage.id;
      delete $localStorage.token;
      delete $localStorage.baseUrl;
      $rootScope.logged_in_user = null;
      $timeout(function(){
        $state.go('login')
        toastr.info('You are now logged out.')
      }, 200)
    }

}])