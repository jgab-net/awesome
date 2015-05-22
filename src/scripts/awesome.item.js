'use strict';

angular
  .module('awesome')
  .directive('netAwesomeItem', function () {

    return {
      restrict: 'E',
      require:'netAwesome',
      replace: true,
      templateUrl: 'views/awesome.item.html',
      controllerAs: 'item',
      bindToController: true,
      transclude: true,
      scope: {

      },
      controller: function () {

      },
      link: function (scope, element, attrs, controller) {

      }
    };
  });
