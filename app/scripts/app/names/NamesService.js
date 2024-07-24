'use strict';

/* Names API Endpoint Service, Extension for API requests for Name Entries resources only. Adapted from code base */
angular.module('NamesModule').service('NamesService', [
  'baseService',
  'toastr',
  '$state',
  '$localStorage',
  '$timeout',
  '_',
  function (api, toastr, $state, $localStorage, $timeout, _) {
    var cacheNames = function () {
      return api.get('/v1/names?all=true').success(function (resp) {
        $localStorage.entries = resp;
      });
    };
    // TODO turn to a component
    var isEmptyObj = function (obj) {
      // null and undefined are "empty"
      if (obj === null) {
        return true;
      }
      // Assume if it has a length property with a non-zero value
      // that that property is correct.
      if (obj.length > 0) {
        return false;
      }
      if (obj.length === 0) {
        return true;
      }
      // Otherwise, does it have any properties of its own?
      // Note that this doesn't handle
      // toString and valueOf enumeration bugs in IE < 9
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;
    };

    /**
      * Adds a name to the database;
      * @param nameEntry
      */
    this.addName = function (name, fn) {
      // include logged in user's details, only if none exist - applies to accepting suggested names
      if (!name.submittedBy)
        name.submittedBy = $localStorage.username;
      return api.postJson('/v1/names', name).success(function () {
        toastr.success(name.name + ' was successfully added. Add another name');
        fn();
        cacheNames();
      }).error(function () {
        toastr.error(name.name + ' could not be added. Please try again.');
      });
    };
    var getPrevAndNextNames = function (name, fn) {
      var index = _.findIndex($localStorage.entries, { name: name }), prev = $localStorage.entries[index - 1], next = $localStorage.entries[index + 1];
      return fn(prev, next);
    };
    this.prevAndNextNames = function (name, fn) {
      if ($localStorage.entries && $localStorage.entries.length)
        return getPrevAndNextNames(name, fn);
      else {
        return api.get('/v1/names').success(function (resp) {
          $localStorage.entries = resp;
          return getPrevAndNextNames(name, fn);
        });
      }
    };
    this.getCachedNames = function (fn) {
      if ($localStorage.entries && $localStorage.entries.length)
        return fn($localStorage.entries);
      else
        return api.get('/v1/names?all=true').success(function (resp) {
          $localStorage.entries = resp;
          return fn($localStorage.entries);
        });
    };
    this.search = function (name) {
      return api.get('/v1/search', { 'q': name });
    };
    /**
      * Updates an existing name in the database;
      * @param nameEntry
      */
    this.updateName = function (originalName, nameEntry, fn) {
      nameEntry = angular.copy(nameEntry);
      nameEntry.submittedBy = $localStorage.username;
      return api.putJson('/v1/names/' + originalName, nameEntry).success(function (resp) {
        toastr.success(nameEntry.name + ' was successfully updated.');
        cacheNames();
        if (fn)
          return fn(resp);
      }).error(function () {
        toastr.error(nameEntry.name + ' could not be updated. Please try again.');
      });
    };
    /**
      * Deletes a name from the database;
      * @param nameEntry
      */
    this.deleteName = function (entry, fn, status) {
      if (status === 'suggested')
        return api.deleteJson('/v1/suggestions/' + entry.id).success(function () {
          toastr.success(entry.name + ' with id: ' + entry.id + ' has been deleted successfully');
          return fn();
        }).error(function () {
          toastr.error(entry.name + ' with id: ' + entry.id + ' could not be deleted. Please try again.');
        });
      return api.deleteJson('/v1/names/' + entry.name, entry).success(function () {
        toastr.success(entry.name + ' has been deleted successfully');
        cacheNames();
        fn();
      }).error(function () {
        toastr.error(entry.name + ' could not be deleted. Please try again.');
      });
    };
    this.deleteNames = function (names, fn, status) {
      names = _.pluck(names, 'name');
      if (status === 'suggested')
        return api.deleteJson('/v1/suggestions/batch', names).success(function () {
          toastr.success(names.length + ' suggested names have been deleted');
          return fn();
        }).error(function () {
          toastr.error('Could not delete selected names. Please try again.');
        });
      return api.deleteJson('/v1/names/batch', names).success(function () {
        toastr.success(names.length + ' names have been deleted successfully');
        cacheNames();
        return fn();
      }).error(function () {
        toastr.error('Could not delete selected names. Please try again.');
      });
    };
    /**
       * Get a name
       * returns the one or zero result
       */
    this.getName = function (name, duplicate, fn) {
      return api.get('/v1/names/' + name, { duplicates: duplicate }).success(function (resp) {
        return fn(resp);
      });
    };
    this.getNames = function (filter) {
      filter = !isEmptyObj(filter) ? filter : {};
      filter.page = filter.page || 1;
      filter.count = filter.count || 50;
      filter.orderBy = 'createdAt';
      if (filter.status === 'suggested')
        return api.get('/v1/suggestions');
      else if (filter.status === 'published')
        filter.state = 'PUBLISHED';
      else if (filter.status === 'unpublished')
        filter.state = 'NEW';
      else if (filter.status === 'modified')
        filter.state = 'MODIFIED';
      return api.get('/v1/names', filter);
    };
    this.countNames = function (status, fn) {
      var endpoint = '/v1/names/meta';
      if (status === 'published')
        endpoint = '/v1/search/meta';
      if (status === 'suggested')
        endpoint = '/v1/suggestions/meta';
      return api.get(endpoint, { count: true }).success(function (resp) {
        if (status === 'modified')
          return fn(resp.totalModifiedNames);
        else if (status === 'published')
          return fn(resp.totalPublishedNames);
        else if (status === 'unpublished')
          return fn(resp.totalNewNames);
        else if (status === 'suggested')
          return fn(resp.totalSuggestedNames);
        else if (status === 'all')
          return fn(resp.totalNames);
        else
          return fn(resp);
      });
    };
    this.getRecentlyIndexedNames = function (fn) {
      return api.get('/v1/search/activity?q=index').success(fn);
    };
    this.addNameToIndex = function (name) {
      return api.postJson('/v1/search/indexes/' + name);
    };
    this.removeNameFromIndex = function (name) {
      return api.deleteJson('/v1/search/indexes/' + name);
    };
    this.addNamesToIndex = function (namesJsonArray) {
      var names = _.pluck(namesJsonArray, 'name');
      return api.postJson('/v1/search/indexes/batch', names);
    };
    this.removeNamesFromIndex = function (namesJsonArray) {
      var names = _.pluck(namesJsonArray, 'name');
      return api.deleteJson('/v1/search/indexes/batch', names);
    };
    this.getRecentFeedbacks = function (fn) {
      return api.get('/v1/feedbacks').success(fn);
    };
    this.getFeedback = function (name, fn) {
      return api.get('/v1/feedbacks/', {
        name: name,
        feedback: true
      }).success(function (resp) {
        return fn(resp);
      });
    };
    this.deleteFeedbacks = function (name, fn) {
      return api.deleteJson('/v1/feedbacks/?name=' + name).success(fn).error(function () {
        return toastr.error('Feedbacks on ' + name + ' were not deleted. Please try again.');
      });
    };
    this.deleteFeedback = function (id, name, fn) {
      return api.deleteJson('/v1/feedbacks/' + name + '/' + id).success(fn).error(function () {
        return toastr.error('Feedback was not deleted. Please try again.');
      });
    };
  }
]);