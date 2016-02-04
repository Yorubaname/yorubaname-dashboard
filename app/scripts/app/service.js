/* Services */
angular.module('ui.load', [])
    .service('uiLoad', ['$document','$q','$timeout', function ($document, $q, $timeout) {
            var loaded = [
            ];
            var promise = false;
            var deferred = $q.defer();
            this.load = function (srcs) {
                srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                var self = this;
                if (!promise) {
                    promise = deferred.promise;
                }
                angular.forEach(srcs, function (src) {
                    promise = promise.then(function () {
                        return src.indexOf('.css') >= 0 ? self.loadCSS(src) : self.loadScript(src);
                    });
                });
                deferred.resolve();
                return promise;
            };
            this.loadScript = function (src) {
                if (loaded[src]) return loaded[src].promise;
                var deferred = $q.defer();
                var script = $document[0].createElement('script');
                script.src = src;
                script.onload = function (e) {
                    $timeout(function () {
                        deferred.resolve(e);
                    });
                };
                script.onerror = function (e) {
                    $timeout(function () {
                        deferred.reject(e);
                    });
                };
                $document[0].body.appendChild(script);
                loaded[src] = deferred;
                return deferred.promise;
            };
            this.loadCSS = function (href) {
                if (loaded[href]) return loaded[href].promise;
                var deferred = $q.defer();
                var style = $document[0].createElement('link');
                style.rel = 'stylesheet';
                style.type = 'text/css';
                style.href = href;
                style.onload = function (e) {
                    $timeout(function () {
                        deferred.resolve(e);
                    });
                };
                style.onerror = function (e) {
                    $timeout(function () {
                        deferred.reject(e);
                    });
                };
                var main_stylesheet = document.getElementById("mainCss");
                if (main_stylesheet) {
                    var parent_style = main_stylesheet.parentNode;
                    parent_style.insertBefore(style, main_stylesheet);
                } else {
                    $document[0].head.appendChild(style);
                }
                loaded[href] = deferred;
                return deferred.promise;
            };
        }
    ]);


/* API Endpoint Service for API requests: Adapted from code base */

dashboardappApp

  .service('api', ['$http', function($http) {

    this.get = function(endpoint, data, headers) {
        return $http({
            method: 'GET',
            url: endpoint,
            params: data ? data : '',
            headers: headers ? headers : ''
        })
    }
    this.post = function(endpoint, data) {
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        return $http({
            method: 'POST',
            url: endpoint,
            data: $.param(data)
        })
    }
    this.postJson = function(endpoint, data) {
        return $http({
            method: 'POST',
            url: endpoint,
            data: data ? data : ''
        })
    }
    this.put = function(endpoint, data) {
        $http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";
        return $http({
            method: 'PUT',
            url: endpoint,
            data: data ? data : ''
        })
    }
    this.putJson = function(endpoint, data) {
        return $http({
            method: 'PUT',
            url: endpoint,
            data: data ? data : ''
        })
    }
    this.delete = function(endpoint, data) {
      $http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";
      return $http({
        method: 'DELETE',
        url: endpoint,
        data: data ? data : ''
      })
    }
    this.deleteJson = function(endpoint, data) {
        // had to explicitly set the content-type for the delete request to work, Why? I do not know yet
        $http.defaults.headers.common['Content-Type'] = "application/json";
        return $http({
            method: 'DELETE',
            url: endpoint,
            data: data ? data : ''
        })
    }
    this.authenticate = function(authData) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + authData;
        return $http({
            method: 'POST',
            url: "/v1/auth/login"
        })
    }
}])


/* Authentication API Endpoint Service, Extension for API requests for Signing In, Out, and Session validation. Adapted from code base */

dashboardappApp

  .service('authApi', ['api', 'usersApi', '$localStorage', '$state', '$rootScope', '$timeout', 'toastr', 'baseUrl', function(api, usersApi, $localStorage, $state, $rootScope, $timeout, toastr, baseUrl){

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
        authData = btoa(authData.email + ":" + authData.password)
        
        return api.authenticate(authData).success(function(response) {
            $localStorage.isAuthenticated = true;
            $localStorage.id = response.id;
            $localStorage.username = response.username;
            $localStorage.email = response.email;
            $localStorage.token = authData;
            $localStorage.baseUrl = baseUrl;

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
      $rootScope.user = null;
      $timeout(function(){
        $state.go('login')
        toastr.info('You are now logged out.')
      }, 200)
    }

}])

/* Users API Endpoint Service */

dashboardappApp

  .service('usersApi', ['api', '$state', 'toastr', function(api, $state, toastr){

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

/* Names API Endpoint Service, Extension for API requests for Name Entries resources only. Adapted from code base */

dashboardappApp

  .service('namesApi', ['api', 'toastr', '$state', '$localStorage', '$timeout', '_', '$filter', function(api, toastr, $state, $localStorage, $timeout, _, $filter) {

      var _this = this;

      /*

      var formatName = function(name) {
        name.geoLocation = JSON.parse( name.geoLocation || '{}' )
        name.pronunciation = $filter('aToString')(name.pronunciation,'-')
        name.syllables = $filter('aToString')(name.syllables,'-')
        name.morphology = $filter('aToString')(name.morphology,'-')
        name.ipaNotation = $filter('aToString')(name.ipaNotation,'-')
        return name
      }

      var deformatName = function(name) {
        name.geoLocation = JSON.stringify( name.geoLocation )
        name.pronunciation = $filter('sToArray')(name.pronunciation,'-')
        name.syllables = $filter('sToArray')(name.syllables,'-')
        name.morphology = $filter('sToArray')(name.morphology,'-')
        name.ipaNotation = $filter('sToArray')(name.ipaNotation,'-')
        return name
      }

      */

      /**
      * Adds a name to the database;
      * @param nameEntry
      */
      this.addName = function (name, fn) {
        // include logged in user's details, only if none exist - applies to accepting suggested names
        if (!name.submittedBy) name.submittedBy = $localStorage.username;
        return api.postJson("/v1/names", name).success(function(resp){
          toastr.success(name.name + ' was successfully added. Add another name')
          fn()
          cacheNames()
        }).error(function(resp){
          toastr.error(name.name + ' could not be added. Please try again.')
        })
      }

      var getPrevAndNextNames = function(name, fn) {
        var index = _.findIndex($localStorage.entries, { name: name }),
             prev = $localStorage.entries[index - 1],
             next = $localStorage.entries[index + 1]
          return fn(prev, next)
      }

      this.prevAndNextNames = function(name, fn){
        if( $localStorage.entries && $localStorage.entries.length ) return getPrevAndNextNames(name, fn)
        else {
          return api.get('/v1/names').success(function(resp){
            $localStorage.entries = resp
            return getPrevAndNextNames(name, fn)
          })
        }
      }

      var cacheNames = function(){
        return api.get('/v1/names?all=true').success(function(resp){
          $localStorage.entries = resp
        })
      }

      this.getCachedNames = function(fn){
        if($localStorage.entries && $localStorage.entries.length ) return fn($localStorage.entries)
        else return api.get('/v1/names?all=true').success(function(resp){
          $localStorage.entries = resp
          return fn($localStorage.entries)
        })
      }

      this.search = function(name){
        return api.get('/v1/search',{'q':name})
      }

      /**
      * Updates an existing name in the database;
      * @param nameEntry
      */
      this.updateName = function(originalName, nameEntry, fn){
        nameEntry = angular.copy( nameEntry )
        return api.putJson("/v1/names/" + originalName,  nameEntry).success(function(resp){
          toastr.success(nameEntry.name + ' was successfully updated.')
          cacheNames()
          if (fn) return fn(resp)
        }).error(function(resp){
          toastr.error(nameEntry.name + ' could not be updated. Please try again.')
        })
      }

      /**
      * Deletes a name from the database;
      * @param nameEntry
      */
      this.deleteName = function (entry, fn, status) {

        if (status == 'suggested') 
          return api.delete("/v1/suggestions/" + entry.id).success(function(resp){
            toastr.success(entry.name + ' with id: ' + entry.id + ' has been deleted successfully')
            return fn()
          }).error(function(resp){
            toastr.error(entry.name + ' with id: ' + entry.id + ' could not be deleted. Please try again.')
          })

        return api.deleteJson("/v1/names/" + entry.name, entry).success(function(resp){
          toastr.success(entry.name + ' has been deleted successfully')
          cacheNames()
          fn()
        }).error(function(resp){
          toastr.error(entry.name + ' could not be deleted. Please try again.')
        })

      }

      this.deleteNames = function (names, fn, status) {

        names = _.pluck(names, 'name')

        if (status == 'suggested') 
          return api.deleteJson("/v1/suggestions/batch", names).success(function(resp){
            toastr.success(names.length + ' suggested names have been deleted')
            return fn()
          }).error(function(resp){
            toastr.error('Could not delete selected names. Please try again.')
          })

        return api.deleteJson("/v1/names/batch", names).success(function(resp){
          toastr.success(names.length + ' names have been deleted successfully')
          cacheNames()
          return fn()
        }).error(function(resp){
          toastr.error('Could not delete selected names. Please try again.')
        })

      }

      /**
       * Get a name
       * returns the one or zero result
       */
      this.getName = function (name, duplicate, fn) {
        return api.get('/v1/names/' + name, { duplicates: duplicate }).success(function(resp){
          return fn ( resp )
        })
      }

      this.getNames = function (filter) {
        filter = !isEmptyObj(filter) ? filter : {}
        filter.page = filter.page || 1
        filter.count = filter.count || 50
        filter.orderBy = 'createdAt'

        if (filter.status == 'suggested') return api.get('/v1/suggestions')
        else if (filter.status == 'published') filter.state = 'PUBLISHED';
        else if (filter.status == 'unpublished') filter.state = 'NEW';
        else if (filter.status == 'modified') filter.state = 'MODIFIED';
      
        return api.get('/v1/names', filter)
      }


      this.countNames = function(status, fn){
        var endpoint = '/v1/names/meta'
        if (status == 'published') endpoint = '/v1/search/meta'
        if (status == 'suggested') endpoint = '/v1/suggestions/meta'
        return api.get(endpoint, { count: true }).success(function(resp){
          if (status == 'modified') return fn(resp.totalModifiedNames)
          else if (status == 'published') return fn(resp.totalPublishedNames)
          else if (status == 'unpublished') return fn(resp.totalNewNames)
          else if (status == 'suggested') return fn(resp.totalSuggestedNames)
          else if (status == 'all') return fn(resp.totalNames)
          else return fn(resp)
        })
      }

      this.getRecentlyIndexedNames = function(fn){
        return api.get('/v1/search/activity?q=index').success(fn)
      }

      this.addNameToIndex = function (name) {
        return api.postJson('/v1/search/indexes/' + name)
      }
      this.removeNameFromIndex = function (name) {
        return api.deleteJson('/v1/search/indexes/' + name)
      }

      this.addNamesToIndex = function (namesJsonArray) {
        var names = _.pluck(namesJsonArray, 'name')
        return api.postJson('/v1/search/indexes/batch', names)
      }
      this.removeNamesFromIndex = function (namesJsonArray) {
        var names = _.pluck(namesJsonArray, 'name')
        return api.deleteJson('/v1/search/indexes/batch', names)
      }

      this.getRecentFeedbacks = function(fn){
        return api.get('/v1/feedbacks').success(fn)
      }

      this.getFeedback = function(name, fn) {
        return api.get('/v1/feedbacks/?name='+name+'/', { feedback: true }).success(function(resp){
          return fn( resp.feedback )
        })
      }

      this.deleteFeedbacks = function(name, fn) {
        return api.deleteJson('/v1/feedbacks/?name='+name).success(fn).error(function(){
          return toastr.error('Feedbacks on ' + name + ' were not deleted. Please try again.')
        })
      }

      this.deleteFeedback = function(id, fn) {
        return api.deleteJson('/v1/feedbacks/'+id).success(fn).error(function(){
          return toastr.error('Feedback was not deleted. Please try again.')
        })
      }

}])

dashboardappApp

  .service('geolocation', ['$http', function($http) {
    this.load = function(query) {
      return $http.get('/v1/admin/geolocations')
    }
}])

dashboardappApp

  .service('uploader', ['FileUploader', 'baseUrl', 'toastr', '$localStorage', '$state', function(FileUploader, baseUrl, toastr, $localStorage, $state) {

    FileUploader.prototype.setEndpoint = function setEndpoint(endpoint){
      this.url = baseUrl + endpoint
    }

    return function(endpoint, options) {

      var uploader = new FileUploader({ 
          url: baseUrl + endpoint, 
          alias:'nameFiles',
          headers:{
            Authorization: 'Basic ' + $localStorage.token
          }
        }),
        options = options || {},
        fileType = options.fileType || ['text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        maxUpload = options.maxUpload || 1,
        invalidFileMsg = options.invalidFileMsg || 'File type is not supported',
        uploadLimitMsg = options.uploadLimitMsg || 'You may only upload one file at a time',
        onError = options.onErrorMsg || 'An error occur while uploading the file, please retry',
        onComplete = options.onCompleteMsg || 'File upload completed successfully',
        errorCallback = options.errorCallback || function(){},
        successCallback = options.successCallback || function(){}

      // FILTERS

      uploader.filters.push({
          name: 'customFilter',
          fn: function(item /*{File|FileLikeObject}*/, options) {
              return (fileType.indexOf(item.type) >= 0 && this.queue.length < maxUpload)
          }
      })

      // CALLBACKS
      uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        if (fileType.indexOf(item.type) < 0) return toastr.warning('Invalid File' + invalidFileMsg);
        if (this.queue.length == maxUpload) return toastr.warning('Single upload' + uploadLimitMsg);
      }
      uploader.onAfterAddingFile = function (fileItem) {
        console.info('onAfterAddingFile', fileItem);
      }
      uploader.onAfterAddingAll = function (addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
        if (!options.manualTrigger) addedFileItems[0].upload();
      }
      uploader.onBeforeUploadItem = function (item) {
        console.info('onBeforeUploadItem', item);
      }
      uploader.onProgressItem = function (fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
      }
      uploader.onProgressAll = function (progress) {
        console.info('onProgressAll', progress);
      }
      uploader.onSuccessItem = function (fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
      }
      uploader.onErrorItem = function (fileItem, response, status, headers) {
        //console.info('onErrorItem', fileItem, response, status, headers);
        toastr.error('Upload Error' + onError);
        fileItem.remove();
        errorCallback(response);
      }
      uploader.onCancelItem = function (fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      }
      uploader.onCompleteItem = function (fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
        toastr.success('Upload Complete' + onComplete);
        //console.log('before running cb');
        successCallback(response)
        //console.log('after running cb');
        fileItem.remove()
        //$state.go("auth.names.list_entries", {status:'all'})
      }
      uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
      }

      return uploader

    }

  }
])