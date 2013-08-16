var isotopeApp;

isotopeApp = angular.module("isotopeApp", ["iso.directives"]);

isotopeApp.config([
  "$routeProvider", function($routeProvider) {
    "use strict";
    return $routeProvider.when("/", {
      templateUrl: "views/main.html"
    }).otherwise({
      redirectTo: "/"
    });
  }
]);
