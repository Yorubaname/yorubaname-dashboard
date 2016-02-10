/* Directives */

dashboardappApp

    // Directive adds user roles the User Form
    .directive('userForm', ['usersService', '$stateParams', function(api, $stateParams) {
        return {
            link: function(scope, element, attrs) {

              // Set the user object on the scope
              if ($stateParams.id != undefined) // This is true for Updating User Info
                  api.getUser($stateParams.id).success(function(user){
                    scope.user = user
                  })
              else scope.user = {}

              // User Roles
              scope.roles = {
                BASIC_LEXICOGRAPHER: 'ROLE_BASIC_LEXICOGRAPHER',
                PRO_LEXICOGRAPHER: 'ROLE_PRO_LEXICOGRAPHER',
                ADMIN: 'ROLE_ADMIN'
              }

              // Callback on submit
              scope.submit = function () {
                scope.user.roles = $.map( scope.roles, function( value, key ) {
                  if (value != false) return key
                })
                if (!scope.user.id) return api.addUser(scope.user)
                else return api.updateUser(scope.user)
              }

            }
        }
    }])