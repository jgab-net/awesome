'use strict';

angular
  .module('awesome')
  .directive('netAwesomeItem', function () {

    return {
      restrict: 'E',
      require:'^netAwesome',
      replace: true,
      templateUrl: 'views/awesome.item.html',
      controllerAs: 'awesomeItem',
      bindToController: true,
      transclude: true
    };
  });
