angular.module('iso.services', ['iso.config'], function($provide) {
  $provide.factory('optionsStore', ['iso.config', function(config) {
    'use strict';
    var storedOptions = config.defaultOptions || {};

    return {
      store: function(option) {
        storedOptions = $.extend.apply( null, [true, storedOptions].concat(option) );
      }
      , retrieve: function() {
        return storedOptions;
      }
    };
  }]);
});
