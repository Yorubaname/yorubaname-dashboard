
/* Users API Endpoint Service */

dashboardappApp

  .service('usersService', ['baseService', '$state', 'toastr', function(api, $state, toastr){

    this.getUser = function(userId){
      return api.get('/v1/users/'+userId)
    }

    this.addUser = function(user){
      return api.postJson("/v1/auth/create", user)
               .success(function(resp) {
                  toastr.success('User account with email '+user.email+' successfully created.')
               })
               .error(function(resp) {
                 console.log(resp)
                 toastr.error('User account could not be created. Try again.')
               })
    }

    /* updated user information */
    this.updateUser = function(user){
      return api.putJson("/v1/auth/users", user)
               .success(function(resp) {
                  toastr.success('User account with email '+user.email+' successfully updated.')
                  $state.go('auth.users.list_users')
               })
               .error(function(resp) {
                 console.log(resp)
                 toastr.error('User account could not be updated. Try again.')
               })
    }

    this.countUsers = function(fn){
      return api.get('/v1/auth/meta', { count: true }).success(function(resp){
        return fn(resp.totalUsers)
      })
    }

    this.getUsers = function(params){
      return api.get("/v1/auth/users", params)
    }

  }])