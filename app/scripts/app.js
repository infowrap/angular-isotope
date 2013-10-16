var isotopeApp;

isotopeApp = angular.module("isotopeApp", ["ngRoute", "iso.directives"]);

isotopeApp.config([
  "$routeProvider", function($routeProvider) {
    "use strict";
    return $routeProvider.when("/", {
      templateUrl: "views/main.html"
    }).when("/test", {
      templateUrl: "views/test.html"
    }).otherwise({
      redirectTo: "/"
    });
  }
]).run([
  "$rootScope", function($rootScope) {
    $rootScope.xList = [
      {
        name: 'a',
        number: '1',
        date: '1360413309421',
        klass: 'purple'
      }, {
        name: 'b',
        number: '5',
        date: '1360213309421',
        klass: 'orange'
      }, {
        name: 'c',
        number: '10',
        date: '1360113309421',
        klass: 'blue'
      }, {
        name: 'd',
        number: '2',
        date: '1360113309421',
        klass: 'green'
      }, {
        name: 'e',
        number: '6',
        date: '1350613309421',
        klass: 'green'
      }, {
        name: 'f',
        number: '21',
        date: '1350613309421',
        klass: 'orange'
      }, {
        name: 'g',
        number: '3',
        date: '1340613309421',
        klass: 'blue'
      }, {
        name: 'h',
        number: '7',
        date: '1330613309001',
        klass: 'purple'
      }, {
        name: 'i',
        number: '22',
        date: '1360412309421',
        klass: 'blue'
      }
    ];
    return $rootScope.addToList = function() {
      var newItem, s;
      s = angular.element('#isotopeContainer').scope();
      s.count = s.count || 0;
      newItem = {
        name: 'add',
        number: s.count--,
        date: Date.now(),
        klass: 'purple'
      };
      return s.xList.push(newItem);
    };
  }
]);
