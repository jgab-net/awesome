'use strict';

angular
  .module('awesome', [])
  .directive('netAwesome', function ($parse, AwesomeService) {
    return {
      restrict: 'E',
      require: 'ngModel',
      replace: true, //DEPECRATED
      templateUrl: 'views/awesome.html',
      controllerAs: 'awesome',
      bindToController: true,
      transclude: true,
      scope: {
        placeholder: '@?',
        base: '@list',
        filter: '@'
      },
      controller: function ($scope) {
        this.filter = this.filter || 'label';
        this.placeholder = this.placeholder || 'search...';

        var expression = this.base.match( /^\s*(\w+)\s+in\s+([\w.]+)\s*$/i );
        if (!expression) {
          throw(new Error("list only supports ITEM in COLLECTION syntax."));
        }

        this.item = expression[1];
        this.list = AwesomeService.flatTree($parse(expression[2])($scope.$parent));
      },
      link: function (scope, element, attrs, ngModel, $transclude) {
        var $input = element.find('.aw-input');
        var $placeholder = element.find('.aw-placeholder');
        var $list = element.find('.aw-list');

        var remove = {};

        scope.$watchCollection('awesome.suggestions', function (collection) {
          if (!collection) return;

          var transclude = function (clone, childScope) {
            childScope[scope.awesome.item] = collection[i];

            remove[collection[i][scope.awesome.filter]] = {
              clone: angular.element('<li/>').append(clone),
              scope: childScope,
              clear: false
            };

            $list.append(remove[collection[i][scope.awesome.filter]].clone);
          };

          for (var i=0, l=collection.length; i<l; i++) {

            //TODO spaces in properties.
            if (remove[collection[i][scope.awesome.filter]]) {
              remove[collection[i][scope.awesome.filter]].clear = false;
              continue;
            }

            $transclude(transclude);
          }

          if (remove) {
            for (var key in remove){
              if (remove[key].clear) {
                remove[key].clone.remove();
                remove[key].scope.$destroy();
                delete remove[key];
              } else {
                remove[key].clear = true;
              }
            }
            console.log(remove);
          }
        });

        $input.on('input', function () {
          var value = $input.html();
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list, scope.awesome.filter, value
          );
          scope.$apply();
        });

        $input.on('focusin', function () {
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list, scope.awesome.filter
          );
          if ($input.find('.aw-placeholder').length !== 0) {
            $input.html('');
          }
          scope.$apply();
        });

        $input.on('focusout', function () {
          if ($input.html() === '') {
            $input.append($placeholder);
          }
        });
      }
    };
  });
