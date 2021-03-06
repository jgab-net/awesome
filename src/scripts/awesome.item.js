'use strict';

angular
  .module('netAwesome')
  .directive('netAwesomeItem', function () {

    return {
      restrict: 'E',
      require:'^netAwesome',
      replace: true,
      templateUrl: 'views/awesome.item.html',
      transclude: true,
      link: function (scope, element, attrs, controller) {

        element.on('mouseenter', function () {
          controller.select = scope.$index;
          scope.$apply();
        });

        element.on('click', function (event) {
          if (controller.active()) {
            controller.focus();
            scope.$apply();
          }
        });
      }
    };
  });
