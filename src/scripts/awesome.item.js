'use strict';

angular
  .module('awesome')
  .directive('netAwesomeItem', function () {

    return {
      restrict: 'E',
      require:'^netAwesome',
      replace: true,
      templateUrl: 'views/awesome.item.html',
      transclude: true,
      link: function (scope, element, attrs, controller) {
        /*$transclude(scope, function (clone){
          element.append(clone);
        });*/

      }
    };
  });
