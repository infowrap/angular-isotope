angular.module('iso.config', []).value('iso.config', {});

angular.module('iso.filters', ['iso.config']);

angular.module("iso.services", ["iso.config"], [
  '$provide', function($provide) {
    return $provide.factory("optionsStore", [
      "iso.config", function(config) {
        "use strict";
        var storedOptions;
        storedOptions = config.defaultOptions || {};
        return {
          store: function(option) {
            return storedOptions = $.extend.apply(null, [true, storedOptions].concat(option));
          },
          retrieve: function() {
            return storedOptions;
          }
        };
      }
    ]);
  }
]);

angular.module("iso.controllers", ["iso.config", "iso.services"]).controller("angularIsotopeController", [
  "iso.config", "$scope", "$rootScope", "$timeout", "optionsStore", function(config, $scope, $rootScope, $timeout, optionsStore) {
    "use strict";
    var buffer, getIsoOptions, initEventHandler, isoMode, isotopeContainer, methodHandler, onLayoutEvent, optionsHandler, postInitialized, scope;
    onLayoutEvent = "isotope.onLayout";
    postInitialized = false;
    isotopeContainer = null;
    buffer = [];
    scope = "";
    isoMode = "";
    $scope.$on(onLayoutEvent, function(event) {});
    $scope.layoutEventEmit = function($elems, instance) {
      return $timeout(function() {
        return $scope.$apply(function() {
          return $scope.$emit(onLayoutEvent);
        });
      });
    };
    initEventHandler = function(fun, evt, hnd) {
      if (evt) {
        return fun.call($scope, evt, hnd);
      }
    };
    getIsoOptions = function() {
      var isoOptions;
      isoOptions = $scope.isoOptions || optionsStore.retrieve();
      $.extend(isoOptions, {
        onLayout: $scope.layoutEventEmit
      });
      return isoOptions;
    };
    $scope.init = function(isoInit) {
      isotopeContainer = isoInit.element;
      initEventHandler($scope.$on, isoInit.isoOptionsEvent, optionsHandler);
      initEventHandler($scope.$on, isoInit.isoMethodEvent, methodHandler);
      $scope.isoMode = isoInit.isoMode || "addItems";
      return $timeout(function() {
        postInitialized = true;
        return isotopeContainer.isotope(getIsoOptions());
      });
    };
    $scope.setIsoElement = function($element) {
      if (postInitialized) {
        return $timeout(function() {
          return isotopeContainer.isotope($scope.isoMode, $element);
        });
      }
    };
    $scope.refreshIso = function() {
      if (postInitialized) {
        return isotopeContainer.isotope('reloadItems').isotope(getIsoOptions());
      }
    };
    $scope.updateOptions = function(option) {
      var isoOptions;
      if (isotopeContainer) {
        isoOptions = getIsoOptions();
        $.extend(isoOptions, option);
        return isotopeContainer.isotope(isoOptions);
      } else {
        return optionsStore.store(option);
      }
    };
    optionsHandler = function(event, option) {
      return $scope.updateOptions(option);
    };
    methodHandler = function(event, option) {
      var fun, params;
      fun = option.fun;
      params = option.params;
      return fun.apply($scope, params);
    };
    $scope.removeAll = function(cb) {
      return isotopeContainer.isotope("remove", isotopeContainer.data("isotope").$allAtoms, cb);
    };
    $scope.$on('$destroy', function() {
      if (isotopeContainer && postInitialized) {
        return isotopeContainer.isotope('destroy');
      }
    });
    return $rootScope.$on(config.refreshEvent, function() {
      return $scope.refreshIso();
    });
  }
]).controller("isoSortByDataController", [
  "iso.config", "$scope", "optionsStore", function(config, $scope, optionsStore) {
    var getValue, reduce;
    $scope.getHash = function(s) {
      return "opt" + s;
    };
    $scope.storeMethods = function(methods) {
      return optionsStore.store({
        getSortData: methods
      });
    };
    $scope.optSortData = function(item, index) {
      var $item, elementSortData, fun, genSortDataClosure, selector, sortKey, type;
      elementSortData = {};
      $item = $(item);
      selector = $item.attr("ok-sel");
      type = $item.attr("ok-type");
      sortKey = $scope.getHash(selector);
      fun = ($item.attr("opt-convert") ? eval_("[" + $item.attr("opt-convert") + "]")[0] : null);
      genSortDataClosure = function(selector, type, convert) {
        return function($elem) {
          return getValue(selector, $elem, type, convert);
        };
      };
      elementSortData[sortKey] = genSortDataClosure(selector, type, fun);
      return elementSortData;
    };
    $scope.createSortByDataMethods = function(elem) {
      var options, sortDataArray;
      options = $(elem);
      sortDataArray = reduce($.map(options, $scope.optSortData));
      return sortDataArray;
    };
    reduce = function(list) {
      var reduction;
      reduction = {};
      $.each(list, function(index, item) {
        return $.extend(reduction, item);
      });
      return reduction;
    };
    return getValue = function(selector, $elem, type, evaluate) {
      var getText, item, text, toType, val;
      getText = function($elem, item, selector) {
        var text;
        if (!item.length) {
          return $elem.text();
        }
        text = "";
        switch (selector.charAt(0)) {
          case "#":
            text = item.text();
            break;
          case ".":
            text = item.text();
            break;
          case "[":
            text = item.attr(selector.replace("[", "").replace("]", "").split()[0]);
        }
        return text;
      };
      toType = function(text, type) {
        var numCheck, utility;
        numCheck = function(val) {
          if (isNaN(val)) {
            return Number.POSITIVE_INFINITY;
          } else {
            return val;
          }
        };
        utility = {
          text: function(s) {
            return s.toString();
          },
          integer: function(s) {
            return numCheck(parseInt(s, 10));
          },
          float: function(s) {
            return numCheck(parseFloat(s));
          },
          boolean: function(s) {
            return "true" === s;
          }
        };
        if (utility[type]) {
          return utility[type](text);
        } else {
          return text;
        }
      };
      item = $elem.find(selector);
      text = getText($elem, item, selector);
      val = toType(text, type);
      if (evaluate) {
        return evaluate(val);
      } else {
        return val;
      }
    };
  }
]);

angular.module("iso.directives", ["iso.config", "iso.services", "iso.controllers"]);

angular.module("iso.directives").directive("isotopeContainer", [
  "$injector", "$parse", function($injector, $parse) {
    "use strict";
    var options;
    options = {};
    return {
      controller: "angularIsotopeController",
      link: function(scope, element, attrs) {
        var isoInit, isoOptions, linkOptions;
        linkOptions = [];
        isoOptions = attrs.isoOptions;
        isoInit = {};
        if (isoOptions) {
          linkOptions = $parse(isoOptions)(scope);
          if (angular.isObject(linkOptions)) {
            scope.isoOptions = linkOptions;
          }
        }
        isoInit["element"] = element;
        isoInit["isoOptionsEvent"] = attrs.isoOptionsSubscribe;
        isoInit["isoMethodEvent"] = attrs.isoMethodSubscribe;
        isoInit["isoMode"] = attrs.isoMode;
        if (attrs.isoIgnore !== "true") {
          scope.init(isoInit);
        }
        return element;
      }
    };
  }
]).directive("isotopeItem", [
  "iso.config", "$timeout", function(config, $timeout) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var $element, correctScope;
        $element = $(element);
        correctScope = (scope.hasOwnProperty("$root") ? scope.$parent : scope);
        correctScope.setIsoElement($element);
        if (attrs.ngRepeat && true === correctScope.$last && "addItems" === correctScope.isoMode) {
          element.ready(function() {
            return $timeout((function() {
              return correctScope.refreshIso();
            }), config.refreshDelay || 0);
          });
        }
        return element;
      }
    };
  }
]).directive("isoSortbyData", [
  "optionsStore", function(optionsStore) {
    return {
      restrict: "A",
      controller: "isoSortByDataController",
      replace: true,
      link: function(scope, element, attrs) {
        var methSet, methods, optEvent, optKey, optionSet, options;
        optionSet = $(element);
        optKey = optionSet.attr("data-ok-key");
        optEvent = "iso-opts";
        options = {};
        methSet = optionSet.children().find("[data-ok-sel]");
        methSet.each(function(index) {
          var $this;
          $this = $(this);
          return $this.attr("data-ok-sortby-key", scope.getHash($this.attr("data-ok-sel")));
        });
        methods = scope.createSortByDataMethods(methSet);
        return scope.storeMethods(methods);
      }
    };
  }
]).directive("optKind", function() {
  return {
    restrict: "A",
    replace: true,
    link: function(scope, element, attrs) {
      var createOptions, doOption, emitOption, optKey, optPublish, optionSet, preSelectOptions, selected;
      optionSet = $(element);
      optPublish = attrs.optPublish || "opt-kind";
      optKey = optionSet.attr("data-ok-key");
      selected = optionSet.find(".selected");
      preSelectOptions = {};
      createOptions = function(item) {
        var ascAttr, key, option, virtualSortByKey;
        if (item) {
          option = {};
          virtualSortByKey = item.attr("data-ok-sortby-key");
          ascAttr = item.attr("data-opt-ascending");
          key = virtualSortByKey || item.attr("data-ok-sel");
          if (virtualSortByKey) {
            option["sortAscending"] = (ascAttr ? ascAttr === "true" : true);
          }
          option[optKey] = key;
          return option;
        }
      };
      emitOption = function(option) {
        scope.preSelectOptions = $.extend.apply(null, [true, scope.preSelectOptions].concat(option));
        option["ok"] = scope.preSelectOptions;
        return scope.$emit(optPublish, option);
      };
      doOption = function(event) {
        var selItem;
        event.preventDefault();
        selItem = $(event.target);
        if (selItem.hasClass("selected")) {
          return false;
        }
        optionSet.find(".selected").removeClass("selected");
        selItem.addClass("selected");
        scope.$apply(function() {
          return emitOption(createOptions(selItem));
        });
        return false;
      };
      if (selected.length) {
        scope.preSelectOptions = createOptions(selected);
      }
      return optionSet.on("click", function(event) {
        return doOption(event);
      });
    }
  };
});

angular.module('iso', ['iso.config', 'iso.filters', 'iso.services', 'iso.controllers', 'iso.directives']);
