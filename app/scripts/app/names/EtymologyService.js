'use strict';

angular.module('NamesModule').service('EtymologyService', [
    'baseService',
    'toastr',
    function (api, toastr) {
      /**
       * Fetches the latest meaning for given parts.
       * @param {Array} partsArray - Array of parts to fetch meaning for.
       * @returns {Promise} - A promise that resolves to the response of the API call.
       */
      this.getLatestMeaning = function (partsArray) {
        if (!Array.isArray(partsArray) || partsArray.length === 0) {
          return toastr.error('Parts array is required and should contain at least one part.');
        }
  
        var parts = partsArray.join(',');
        return api.get('/v1/etymology/latest-meaning', { parts: parts })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            toastr.error('Error fetching latest meaning of an Etymology part.');
            throw error;
          });
      };
    }
  ]);
  