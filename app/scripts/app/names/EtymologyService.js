'use strict';

angular.module('NamesModule').service('EtymologyService', [
    'baseService',
    'toastr',
  '$q',
  function (api, toastr, $q) {
      function normalizeText(value) {
        return (value || '').toLowerCase().normalize('NFC').trim();
      }

      function normalizeDefinitionsMap(definitionsByPart) {
        var source = definitionsByPart || {};
        return Object.keys(source).reduce(function (normalized, key) {
          var normalizedKey = normalizeText(key);
          if (!normalizedKey) {
            return normalized;
          }

          normalized[normalizedKey] = Array.isArray(source[key]) ? source[key] : [];
          return normalized;
        }, {});
      }

      /**
       * Fetches English definitions for given parts.
       * @param {Array} partsArray - Array of parts to fetch definitions for.
       * @returns {Promise} - A promise that resolves to the response of the API call.
       */
      this.getMeanings = function (partsArray) {
        if (!Array.isArray(partsArray) || partsArray.length === 0) {
          return toastr.error('Parts array is required and should contain at least one part.');
        }
  
        var parts = partsArray.join(',');
        return api.get('/v1/etymology/meanings', { parts: parts })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            toastr.error('Error fetching English definitions of an Etymology part.');
            throw error;
          });
      };

      this.submitMissingDefinitions = function (etymologyEntries) {
        var entries = Array.isArray(etymologyEntries) ? etymologyEntries : [];
        if (entries.length === 0) {
          return $q.when({ submitted: false, payload: {} });
        }

        var parts = [];
        var seen = {};
        entries.forEach(function (entry) {
          var part = normalizeText(entry && entry.part);
          var meaning = (entry && entry.meaning || '').trim();

          if (!part || !meaning || seen[part]) {
            return;
          }

          seen[part] = true;
          parts.push(part);
        });

        if (parts.length === 0) {
          return $q.when({ submitted: false, payload: {} });
        }

        return this.getMeanings(parts)
          .then(function (definitionsByPart) {
            var normalizedDefinitionsByPart = normalizeDefinitionsMap(definitionsByPart);
            var payload = {};

            entries.forEach(function (entry) {
              var rawPart = entry && entry.part;
              var rawMeaning = entry && entry.meaning;
              var part = normalizeText(rawPart);
              var meaning = (rawMeaning || '').trim();

              if (!part || !meaning || payload[part]) {
                return;
              }

              var existingDefinitions = normalizedDefinitionsByPart[part] || [];
              var meaningExists = existingDefinitions.some(function (definition) {
                return normalizeText(definition) === normalizeText(meaning);
              });

              if (!meaningExists) {
                payload[part] = meaning;
              }
            });

            if (Object.keys(payload).length === 0) {
              return { submitted: false, payload: payload };
            }

            return api.postJson('/v1/etymology/meanings', payload)
              .then(function (response) {
                return {
                  submitted: true,
                  payload: payload,
                  response: response.data
                };
              });
          })
          .catch(function (error) {
            toastr.error('Error sending new etymology meanings to Words API.');
            throw error;
          });
      };
    }
  ]);
  