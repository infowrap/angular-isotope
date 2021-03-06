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
