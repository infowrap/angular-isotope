angular.module('iso.directives')

.directive('isotopeContainer', ['$injector', '$parse', function($injector, $parse) {
	'use strict';
	var options = {};
	return {
		controller: angularIsotopeController,
		link: function(scope,element,attrs) {
			var linkOptions = []
			, isoOptions = attrs.isoOptions
			, isoInit = {}
			;

			// If ui-options are passed, merge them onto global defaults.
			if (isoOptions) {
					linkOptions = $parse(isoOptions)(scope);
					if (angular.isObject(linkOptions)) {
						scope.updateOptions(linkOptions);
					}
			}

			isoInit['element'] = element;
			isoInit['isoOptionsEvent'] = attrs.isoOptionsSubscribe;
			isoInit['isoMethodEvent'] = attrs.isoMethodSubscribe;
			isoInit['isoMode'] = attrs.isoMode;

			if(attrs.isoIgnore !== 'true'){
			  // allow some container iso's to be ignored
			  scope.init(isoInit);
			}
			return element;
		}
	};
}]);

angular.module('iso.directives')

.directive('isotopeItem', ['iso.config', '$timeout', function(config, $timeout) {
	return {
		restrict: 'A',

		link: function(scope,element,attrs) {
			var $element = $(element);

			// handles cases where the isotopeItem is inside an isolate scope
			var correctScope = _.has(scope, '$root') ? scope.$parent : scope;
			//$element.addClass(scope.isotopeOptions.itemClass);
			correctScope.setIsoElement($element);

			// Refresh after last element.
			if (attrs.ngRepeat && true === correctScope.$last && "addItems" == correctScope.isoMode) {
				element.ready(function () {
					// mobile is just a bit slower, allow module configuration to provide a reasonable delay based on platform
					$timeout(function() {correctScope.refreshIso()}, config.refreshDelay || 0);
				});
			}
			return element;
		}
	};
}]);

