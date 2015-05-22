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
        filter: '@',
        childrens: '@'
      },
      controller: function ($scope) {
        this.filter = this.filter || 'label';
        this.placeholder = this.placeholder || 'search...';

        var expression = this.base.match( /^\s*(\w+)\s+in\s+([\w.]+)\s*$/i );
        if (!expression) {
          throw(new Error("list only supports ITEM in COLLECTION syntax."));
        }

        this.item = expression[1];
        this.list = [AwesomeService.flatTree($parse(expression[2])($scope.$parent))];
      },
      link: function (scope, element, attrs, ngModel, $transclude) {
        var $input = element.find('.aw-input');
        var $placeholder = element.find('.aw-placeholder');
        var $list = element.find('.aw-list');

        scope.$watchCollection('awesome.suggestions', function (collection) {
          if (!collection) return;

          var transclude = function (clone, childScope) {
            childScope[scope.awesome.item] = collection[i];
            $list.append(AwesomeService.cache.store(collection[i][scope.awesome.filter], clone, childScope));
          };

          for (var i=0, l=collection.length; i<l; i++) {
            //TODO spaces in properties.
            if (AwesomeService.cache.exists(collection[i][scope.awesome.filter])) {
              continue;
            }
            $transclude(transclude);
          }

          AwesomeService.cache.clear();
        });

        $input.on('input', function () {
          var value = $input.html();
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list[scope.awesome.list.length-1], scope.awesome.filter, value
          );
          scope.$apply();
        });

        $input.on('focusin', function () {
          if ($input.find('.aw-placeholder').length !== 0) {
            $input.html('');
            scope.awesome.suggestions = AwesomeService.filter(
              scope.awesome.list[scope.awesome.list.length-1], scope.awesome.filter
            );
          }
          scope.$apply();
        });

        $input.on('keydown', function (event) {
          var keyCode = event.which || event.keyCode;

          if ((keyCode == 13 || keyCode == 9)) {
            scope.awesome.suggestions = scope.awesome.suggestions[0][scope.awesome.childrens];
            scope.awesome.list.push(scope.awesome.suggestions);
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
