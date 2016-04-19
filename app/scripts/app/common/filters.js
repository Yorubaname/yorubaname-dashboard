'use strict';

angular.module("dashboardappApp")

/**
 * Filter to parse delimated string to arrays
 */

  .filter('sToArray', function() {
    return function(text, delimeter) {
      if (!text || !delimeter) return text;
      return text.split(delimeter)
    }
  })

/**
 * Filter to parse input value arrays to single inline strings
 */

  .filter('aToString', function() {
    return function(inputArray, delimeter) {
      if (!inputArray) return "";
      inputArray = inputArray.reverse()
      var val = "";
      for (var i = inputArray.length - 1; i >= 0; i--) {
        val += inputArray[i].text
        if (i != 0) {
            val += delimeter
        }
      }
      return val
    }
  })

 /**
 * Filter to parse input value array to date string
 */

  .filter('toDateString', ['$filter', function($filter) {
    return function(inputArray) {
      // console.log(typeof inputArray)
      if (typeof inputArray != 'object') return;
      var date = $filter('limitTo')(inputArray, 3)
         date = date.join('-')
      return $filter('date')( date, 'mediumDate' )
    }
  }])

  .filter('capitalize', function() {
    return function(input) {
      if (!input) return;
      // input will be the string we pass in if (input)
      return input[0].toUpperCase() + input.slice(1).toLowerCase()
    } 
  })

  /**
 * Filter to parse input value array to comma separated list
 */

  .filter('list', ['$filter', '_', function($filter, _) {
    return function(inputArray) {
      if (typeof inputArray != 'object') return;
      return _.pluck(inputArray, 'place').join(', ')
    }
  }])