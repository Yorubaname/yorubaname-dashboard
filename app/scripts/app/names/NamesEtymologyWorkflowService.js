'use strict';

angular.module('NamesModule').service('NamesEtymologyWorkflow', [
  '$q',
  function ($q) {
    function normalizePart(part) {
      return (part || '').toLowerCase().normalize('NFC').trim();
    }

    function getUniqueEtymologyParts(morphology) {
      var seen = {};
      var parts = [];

      (morphology || '')
        .split(',')
        .reduce(function (all, value) {
          return all.concat(value.trim().split('-'));
        }, [])
        .map(normalizePart)
        .filter(Boolean)
        .forEach(function (part) {
          if (!seen[part]) {
            seen[part] = true;
            parts.push(part);
          }
        });

      return parts;
    }

    function normalizeDefinitionsMap(definitionsByPart) {
      var source = definitionsByPart || {};
      return Object.keys(source).reduce(function (normalized, key) {
        var normalizedKey = normalizePart(key);
        if (!normalizedKey) {
          return normalized;
        }

        normalized[normalizedKey] = Array.isArray(source[key]) ? source[key] : [];
        return normalized;
      }, {});
    }

    function buildEtymologyFromDefinitions(parts, definitionsByPart) {
      return parts.map(function (part) {
        var partDefinitions = definitionsByPart[part];
        var definitions = Array.isArray(partDefinitions) ? partDefinitions : [];

        return {
          part: part,
          meaning: definitions[0] || '',
          definitions: definitions,
          selectedDefinitionIndex: definitions.length > 0 ? 0 : -1
        };
      });
    }

    this.prepareGlossary = function (morphology, etymologyService) {
      var normalizedMorphology = normalizePart(morphology);
      if (!normalizedMorphology) {
        return $q.when({
          normalizedMorphology: '',
          etymology: []
        });
      }

      var etymologyParts = getUniqueEtymologyParts(normalizedMorphology);
      if (etymologyParts.length === 0) {
        return $q.when({
          normalizedMorphology: normalizedMorphology,
          etymology: []
        });
      }

      return etymologyService.getMeanings(etymologyParts)
        .then(function (definitionsByPart) {
          var normalizedDefinitionsByPart = normalizeDefinitionsMap(definitionsByPart);
          return {
            normalizedMorphology: normalizedMorphology,
            etymology: buildEtymologyFromDefinitions(etymologyParts, normalizedDefinitionsByPart)
          };
        });
    };

    this.formatSubmittedMeaningsMessage = function (submissionResult) {
      if (!submissionResult || !submissionResult.submitted) {
        return '';
      }

      var payload = submissionResult.payload || {};
      var parts = Object.keys(payload);
      if (parts.length === 0) {
        return '';
      }

      var preview = parts
        .slice(0, 3)
        .map(function (part) {
          return part + ': "' + payload[part] + '"';
        })
        .join('; ');
      var suffix = parts.length > 3 ? ' +' + (parts.length - 3) + ' more.' : '';

      return 'Submitted ' + parts.length + ' new definition(s) for review: ' + preview + suffix;
    };
  }
]);
