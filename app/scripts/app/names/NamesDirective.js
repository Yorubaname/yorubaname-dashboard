'use strict';

/* Directives */
angular.module('NamesModule')  // Directive adds the geolocation autocompletes on the tagsInput field of Name Form
  .directive('nameForm', [
    'geolocationService',
    function (geo) {
      return {
        link: function (scope) {
          geo.load().then(function (data) {
            scope.geolocations = data;
          });

          scope.query = function (query) {
            if (!scope.geolocations) return [];

            if (!query || query.trim() === '') {
              // If the query is empty or null, return the full list
              return scope.geolocations;
            }

            // Otherwise, filter the list based on the query
            return scope.geolocations.filter(function (location) {
              return location.place.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
          };
        }
      };
    }
  ])  // Directive adds File Uploader widget on the New Name Form for uploading names in bulk
  .directive('namesUpload', [
    'uploadService',
    function (Uploader) {
      return {
        controller: function ($scope) {
          $scope.uploader = Uploader({
            url: '/v1/names/upload',
            alias: 'nameFiles',
            fileType: [
              'text/csv',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ]
          });
        }
      };
    }
  ])  // Directive adds array of Etymology fields to the Name Form
  .directive('etymology', [
    '$stateParams',
    'EtymologyService',
    'toastr',
    function ($stateParams, etymologyService, toastr) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'tmpls/names/directives/etymology.html',
        link: function (scope) {
          var hasNameModel = function () {
            return !!scope.name;
          };

          var ensureEtymologyArray = function () {
            if (!hasNameModel()) {
              return false;
            }

            if (!Array.isArray(scope.name.etymology)) {
              scope.name.etymology = [];
            }

            return true;
          };

          var normalizePart = function (part) {
            return (part || '').toLowerCase().normalize('NFC').trim();
          };

          var ensureDefinitionState = function (item) {
            if (!Array.isArray(item.definitions)) {
              item.definitions = [];
            }

            if (typeof item.selectedDefinitionIndex !== 'number') {
              item.selectedDefinitionIndex = item.definitions.indexOf(item.meaning);
            }

            if (item.selectedDefinitionIndex < 0 || item.selectedDefinitionIndex >= item.definitions.length) {
              item.selectedDefinitionIndex = -1;
            }
          };

          var applyFetchedDefinitions = function (item, definitions) {
            item.definitions = (definitions || []).filter(Boolean);

            if (item.definitions.length === 0) {
              item.selectedDefinitionIndex = -1;
              item.meaning = item.meaning || '';
              return;
            }

            item.selectedDefinitionIndex = 0;
            item.meaning = item.definitions[0];
          };

          if (!$stateParams.entry && ensureEtymologyArray()) {
            scope.name.etymology = [];
          }

          scope.add_etymology = function () {
            if (!ensureEtymologyArray()) {
              return;
            }

            return scope.name.etymology.push({
              part: '',
              meaning: '',
              definitions: [],
              selectedDefinitionIndex: -1,
              isFresh: true
            });
          };

          scope.fetch_definitions = function (etymology) {
            if (!etymology || !etymology.isFresh) {
              return;
            }

            var normalizedPart = normalizePart(etymology.part);
            if (!normalizedPart) {
              etymology.definitions = [];
              etymology.selectedDefinitionIndex = -1;
              etymology.meaning = '';
              return;
            }

            etymology.part = normalizedPart;

            etymologyService.getMeanings([normalizedPart])
              .then(function (data) {
                var definitions = data && (data[normalizedPart] || data[etymology.part]) || [];
                applyFetchedDefinitions(etymology, definitions);
              })
              .catch(function () {
                toastr.error('Could not fetch English definitions for this etymology part.');
              });
          };

          scope.can_cycle = function (index) {
            var item = scope.name.etymology[index];
            if (!item) {
              return false;
            }

            ensureDefinitionState(item);
            return item.definitions.length > 1;
          };

          scope.cycle_meaning = function (index) {
            var item = scope.name.etymology[index];
            if (!item) {
              return;
            }

            ensureDefinitionState(item);
            if (item.definitions.length <= 1) {
              return;
            }

            item.selectedDefinitionIndex = (item.selectedDefinitionIndex + 1) % item.definitions.length;
            item.meaning = item.definitions[item.selectedDefinitionIndex];
          };

          scope.definition_position = function (index) {
            var item = scope.name.etymology[index];
            if (!item) {
              return 0;
            }

            ensureDefinitionState(item);
            return item.selectedDefinitionIndex >= 0 ? item.selectedDefinitionIndex + 1 : 0;
          };

          scope.definition_total = function (index) {
            var item = scope.name.etymology[index];
            if (!item) {
              return 0;
            }

            ensureDefinitionState(item);
            return item.definitions.length;
          };

          scope.remove_etymology = function (index) {
            if (!ensureEtymologyArray()) {
              return;
            }

            scope.name.etymology.splice(index, 1);
          };

          scope.$watch('name.etymology', function () {
            if (!ensureEtymologyArray()) {
              return;
            }

            if (Array.isArray(scope.name.etymology)) {
              scope.name.etymology.forEach(ensureDefinitionState);
            }
            if (scope.form) {
              scope.form.$dirty = true;
            }
          }, true);
        }
      };
    }
  ]).directive('feedback', [
    'NamesService',
    '$modal',
    '$stateParams',
    '$rootScope',
    function (api, $modal, $stateParams, $rootScope) {
      return {
        //replace: true,
        restrict: 'EA',
        templateUrl: 'tmpls/names/feedbacks.html',
        link: function (scope, element, attributes) {
          api.getFeedback($stateParams.entry, function (resp) {
            scope.feedbacks = resp;
          });
          scope.showFeedbacks = function () {
            $modal.open({
              templateUrl: 'tmpls/names/partials/feedbackModal.html',
              size: 'md',
              controller: function ($scope, $modalInstance) {
                $scope.modalTitle = 'Feedbacks on ' + attributes.name;
                $scope.feedbacks = scope.feedbacks;
                $scope.isAdmin = $rootScope.isAdmin;
                // delete all feedbacks and closes modal
                $scope.deleteFeedbacks = function () {
                  api.deleteFeedbacks(attributes.name, function () {
                    $scope.feedbacks.splice(0, $scope.feedbacks.length);
                    $modalInstance.close();
                  });
                };
                // delete one feedback by id and remove from list
                $scope.deleteFeedback = function (feedback) {
                  api.deleteFeedback(feedback.id, feedback.name, function () {
                    $scope.feedbacks.splice($scope.feedbacks.indexOf(feedback), 1);
                    if (!$scope.feedbacks.length) {
                      $modalInstance.close();
                    }
                  });
                };
                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                };
              }
            });
          };
        }
      };
    }
  ]) // Directive adds array of embedded video fields to the Name Form
  .directive('embeddedVideo', [
    '$stateParams', 'toastr',
    function ($stateParams, toastr) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'tmpls/names/directives/embedded-video.html',
        link: function (scope) {
          if (!$stateParams.entry) {
            scope.name.videos = [];
          }
          scope.add_video = function () {
            if (scope.name.videos === undefined) {
              scope.name.videos = [];
            }
            return scope.name.videos.push({
              videoId: '',
              caption: ''
            });
          };
          scope.remove_video = function (index) {
            scope.name.videos.splice(index, 1);
          };

          scope.initVideoUrl = function (video) {
            if (!video.videoUrl && video.videoId) {
              video.videoUrl = 'https://www.youtube.com/watch?v=' + video.videoId;
            }
          };
          scope.updateVideoId = function (video) {
            var url = video.videoUrl;
            var videoId = video.videoId;

            if (url) {
              var match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
              if (match && match[1]) {
                videoId = match[1];
                video.videoId = videoId;
              } else {
                toastr.error('Invalid YouTube URL');
                video.videoId = '';
              }
            } else if (videoId) {
              video.videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
            }
          };
          scope.$watch('name.videos', function () {
            scope.form.$dirty = true;
          }, true);
        }
      };
    }
  ]);