'use strict';

/* Controllers */
angular.module('NamesModule').controller('NamesAddEntriesCtrl', [
  '$rootScope',
  '$scope',
  'NamesService',
  function ($rootScope, $scope, namesService) {
    $scope.new = true;
    $scope.name = {};
    $scope.submit = function () {
      return namesService.addName($scope.name, function () {
        // reset the form models fields
        $scope.name = {};
      });
    };
  }
]).controller('namesEditEntryCtrl', [
  '$scope',
  '$stateParams',
  '$state',
  'NamesService',
  'EtymologyService',
  'toastr',
  '$window',
  function ($scope, $stateParams, $state, namesService, etymologyService, toastr, $window) {
    var originalName = null;
    namesService.prevAndNextNames($stateParams.entry, function (prev, next) {
      $scope.prev = prev;
      $scope.next = next;
    });
    namesService.getName($stateParams.entry, false, function (resp) {
      $scope.name = resp;
      originalName = resp.name;
    });

    const mapExistingPartMeanings = (etymology) => {
      return etymology.reduce((map, item) => {
        map[item.part.toLowerCase().normalize('NFC')] = item.meaning;
        return map;
      }, {});
    };

    const identifyPartsToFetch = (etymologyParts, existingPartMeanings) => {
      const partsToFetch = [];
      const alreadyAdded = {}; // To prevent duplicates

      etymologyParts.forEach(part => {
        if (!alreadyAdded[part] && !existingPartMeanings[part]) {
          partsToFetch.push(part);
          alreadyAdded[part] = true;
        }
      });

      return partsToFetch;
    };

    const updateEtymology = (etymologyParts, partMeaningDict, etymology) => {
      const alreadyAdded = {};
      let etymologyCounter = 0;

      etymologyParts.forEach(part => {
        if (!alreadyAdded[part]) {
          const newEty = {
            part: part,
            meaning: partMeaningDict[part] || ''
          };

          if (etymology[etymologyCounter]) {
            etymology[etymologyCounter] = newEty;
          } else {
            etymology.push(newEty);
          }

          etymologyCounter++;
          alreadyAdded[part] = true;
        }
      });

      return etymology.slice(0, etymologyCounter);
    };

    $scope.generate_glossary = function () {
      if (!$scope.name.morphology) {
        $scope.name.etymology = [];
        return;
      }

      $scope.name.morphology = $scope.name.morphology.toLowerCase().normalize('NFC');

      let etymology = $scope.name.etymology;
      const partMeaningDict = mapExistingPartMeanings(etymology);
      const etymologyParts = $scope.name.morphology
        .split(',')
        .flatMap(value => value.trim().split('-'))
        .filter(Boolean);
      const partsToFetch = identifyPartsToFetch(etymologyParts, partMeaningDict);

      if (partsToFetch.length > 0) {
        etymologyService.getLatestMeaning(partsToFetch)
          .then(function (data) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                partMeaningDict[key.normalize('NFC')] = data[key];
              }
            }
            $scope.name.etymology = updateEtymology(etymologyParts, partMeaningDict, etymology);
            toastr.success('Successfully fetched etymology meanings from previous words.')
          })
          .catch(function (error) {
            toastr.error('Error fetching latest etymology part meanings.');
            console.error('Error fetching latest etymology part meanings:', error);
          });
      } else {
        $scope.name.etymology = updateEtymology(etymologyParts, partMeaningDict, etymology);
      }
    };

    $scope.publish = function () {
      // update name first, then publish
      return namesService.updateName(originalName, $scope.name, function () {
        // Publish the name
        return namesService.addNameToIndex($scope.name.name).success(function () {
          $scope.name.state = 'PUBLISHED';
          $scope.name.indexed = true;
          toastr.info($scope.name.name + ' has been published');
          return $window.history.back();
        });
      });
    };
    $scope.goto = function (entry) {
      return $state.go('auth.names.edit_entries', { entry: entry });
    };
    $scope.submit = function () {
      return namesService.updateName(originalName, $scope.name);
    };
    $scope.delete = function () {
      if ($window.confirm('Are you sure you want to delete ' + $scope.name.name + '?')) {
        return namesService.deleteName($scope.name, function () {
          return $window.history.back();
        });
      }
    };
  }
]).controller('namesListEntriesCtrl', [
  '$scope',
  'NamesService',
  '$stateParams',
  '$window',
  'toastr',
  function ($scope, namesService, $stateParams, $window, toastr) {
    $scope.namesList = [];
    $scope.status = $stateParams.status;
    $scope.count = 50;
    $scope.pagination = { current: 1 };
    $scope.sort = function (keyname) {
      $scope.sortKey = keyname;
      //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse;  //if true make it false and vice versa
    };
    namesService.countNames($stateParams.status, function (num) {
      $scope.namesListItems = num;
    });
    $scope.fetch = function (newPageNumber, count) {
      return namesService.getNames({
        status: $stateParams.status,
        page: newPageNumber || 1,
        count: count || $scope.itemsPerPage || $scope.count || 50
      }).success(function (responseData) {
        $scope.namesList = [];
        $scope.pagination.current = newPageNumber || 1;
        responseData.forEach(function (name) {
          $scope.namesList.push(name);
        });
      });
    };
    $scope.fetch();
    $scope.delete = function (entry) {
      if (entry && $window.confirm('Are you sure you want to delete ' + entry.name + '?')) {
        return namesService.deleteName(entry, function () {
          $scope.namesList.splice($scope.namesList.indexOf(entry), 1);
          $scope.namesListItems--;
        }, $scope.status);
      }
      var entries = $.map($scope.namesList, function (elem) {
        if (elem.isSelected === true)
          return elem;
      });
      if (!entries.length)
        return toastr.warning('Select names to delete');
      if (!$window.confirm('Are you sure you want to delete the selected names?'))
        return;
      return namesService.deleteNames(entries, function () {
        $scope.fetch($scope.pagination.current, $scope.itemsPerPage);
      }, $scope.status);
    };
    $scope.indexName = function (entry) {
      if (entry.state === 'NEW')
        return namesService.addNameToIndex(entry.name).success(function () {
          entry.state = 'PUBLISHED';
          entry.indexed = true;
        });
      else if (entry.state === 'MODIFIED')
        return namesService.addNameToIndex(entry.name).success(function () {
          entry.state = 'PUBLISHED';
          entry.indexed = true;
        });
      else
        // assume entry is published and objective is to unpublish it
        return namesService.removeNameFromIndex(entry.name).success(function () {
          entry.indexed = false;
          entry.state = 'NEW';
        });
    };
    $scope.republishNames = function () {
      var entries = $.map($scope.namesList, function (elem) {
        if (elem.isSelected === true)
          return elem;
      });
      if (!entries.length)
        return toastr.warning('No names selected to republish');
      return namesService.removeNamesFromIndex(entries).success(function () {
        return namesService.addNamesToIndex(entries).success(function () {
          $.map(entries, function (entry) {
            entry.state = 'PUBLISHED';
            entry.indexed = true;
          });
          toastr.success(entries.length + ' names have been republished');
        });
      });
    };
    $scope.indexNames = function (action) {
      var entries = $.map($scope.namesList, function (elem) {
        if (elem.isSelected === true)
          return elem;
      });
      if (entries.length > 0) {
        if (!action || action === 'add') {
          namesService.addNamesToIndex(entries).success(function () {
            $.map(entries, function (entry) {
              entry.indexed = true;
              entry.state = 'PUBLISHED';
            });
            toastr.success(entries.length + ' names have been published');
          }).error(function () {
            toastr.error('Selected names could not be published');
          });
        } else {
          namesService.removeNamesFromIndex(entries).success(function () {
            $.map(entries, function (entry) {
              entry.indexed = false;
              entry.state = 'NEW';
            });
            toastr.success(entries.length + ' names unpublished');
          }).error(function () {
            return toastr.error('Selected names could not be unpublished');
          });
        }
      } else {
        toastr.warning('No names selected');
      }
    };

    /**
     * Adds the suggested name to the list of names eligible to be added to search index
     * @param {*} entry 
     * @returns 
     */
    function acceptSuggestedName(entry) {
      var name = {
        name: entry.name,
        meaning: entry.details,
        geoLocation: entry.geoLocation,
        submittedBy: entry.email
      };
      if (!$.isEmptyObject(name)) {
        return namesService.addName(name, function () {
          // Name added then delete from the suggested name store
          return namesService.deleteName(entry, function () {
            $scope.namesList.splice($scope.namesList.indexOf(entry), 1);
          }, 'suggested');
        });
      }
    }
    // Accept Suggested Name/s
    $scope.accept = function (entry) {
      if (entry)
        return acceptSuggestedName(entry);
      var entries = $.map($scope.namesList, function (elem) {
        if (elem.isSelected === true)
          return elem;
      });
      if (entries.length > 0) {
        return entries.forEach(function (entry) {
          acceptSuggestedName(entry);
        });
      } else
        toastr.warning('Please select names to accept.');
    };
  }
]).controller('namesByUserListCtrl', [
  '$scope',
  'NamesService',
  '$window',
  function ($scope, namesService, $window) {
    $scope.namesList = [];
    namesService.getNames({ submittedBy: $scope.user.email }).success(function (responseData) {
      $scope.namesListItems = responseData.length;
      $scope.namesList = [];
      responseData.forEach(function (name) {
        $scope.namesList.push(name);
      });
    });
    $scope.$on('onRepeatLast', function () {
      $('#user_list').listnav({
        filterSelector: '.ul_name',
        includeNums: false,
        removeDisabled: true,
        showCounts: false,
        onClick: function () {
          $scope.namesListItems = $window.document.getElementsByClassName('listNavShow').length;
          $scope.$apply();
        }
      });
    });
  }
]).controller('nameSearchCtrl', [
  '$controller',
  '$scope',
  '$stateParams',
  '$localStorage',
  function ($controller, $scope, $stateParams, $localStorage) {
    if ($stateParams.entry) {
      $scope.search = { entry: $stateParams.entry };
      $controller('SearchController', { $scope: $scope });
      $scope.results = $localStorage.searchResults;
    }
  }
]).controller('namesFeedbacksCtrl', [
  '$scope',
  'NamesService',
  '$window',
  'toastr',
  function ($scope, namesService, $window) {
    $scope.count = 50;
    $scope.feedbacks = [];
    $scope.pagination = { current: 1 };
    $scope.sort = function (keyname) {
      $scope.sortKey = keyname;
      //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse;  //if true make it false and vice versa
    };
    $scope.fetch = function (newPageNumber) {
      return namesService.getRecentFeedbacks(function (responseData) {
        $scope.pagination.current = newPageNumber || 1;
        $scope.feedbacks = [];
        responseData.forEach(function (n) {
          $scope.feedbacks.push(n);
        });
      });
    };
    $scope.fetch();
    $scope.delete = function (entry) {
      // delete listed feedback entry
      if (entry && $window.confirm('Are you sure you want to delete this feedback on ' + entry.name + '?')) {
        return namesService.deleteFeedback(entry.id, entry.name, function () {
          $scope.feedbacks.splice($scope.feedbacks.indexOf(entry), 1);
        });
      }
    };
    // noop function as there's no option for mass feedback delete by ids
    $scope.deleteAll = function () {
    };
  }
]);