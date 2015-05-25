'use strict';

angular
  .module('awesome', [])
  .directive('netAwesome', function ($parse, $timeout, AwesomeService) {
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
        childrens: '@',
        cacheKey:'@'
      },
      controller: function ($scope) {
        this.filter = this.filter || 'label';
        this.placeholder = this.placeholder || 'search...';
        this.select = 0;
        this.cacheKey = this.cacheKey || '_id';
        this.show = false;

        var expression = this.base.match( /^\s*(\w+)\s+in\s+([\w.]+)\s*$/i );
        if (!expression) {
          throw(new Error("list only supports ITEM in COLLECTION syntax."));
        }

        this.item = expression[1];
        this.list = [{
          name: undefined,
          list: AwesomeService.flatTree($parse(expression[2])($scope.$parent))
        }];
      },
      link: function (scope, element, attrs, ngModel, $transclude) {
        var $input = element.find('.aw-input');
        var $placeholder = element.find('.aw-placeholder');
        var $list = element.find('.aw-list');

        scope.$watchCollection('awesome.suggestions', function (collection) {
          if (!collection) return;

          var transclude = function (clone, childScope) {
            /** @namespace scope.awesome */
            childScope[scope.awesome.item] = collection[i];
            childScope.$index = i;
            $list.append(AwesomeService.cache.store(collection[i][scope.awesome.cacheKey], clone, childScope));
          };

          for (var i=0, l=collection.length; i<l; i++) {
            if (AwesomeService.cache.exists(collection[i][scope.awesome.cacheKey])) {
              AwesomeService.cache.updateIndex(collection[i][scope.awesome.cacheKey],i);
              continue;
            }
            $transclude(transclude);
          }

          AwesomeService.cache.clear();
        });

        scope.$watchCollection('awesome.list', function (collection) {
          scope.awesome.suggestions = collection[collection.length-1].list;
        });

        $input.on('input', function () {
          var value = $input.html();
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list[scope.awesome.list.length-1].list, scope.awesome.filter, value
          );
          scope.$apply();
        });

        $input.on('focusin', function () {
          if ($input.find('.aw-placeholder').length !== 0) {
            $input.html('');
            scope.awesome.suggestions = AwesomeService.filter(
              scope.awesome.list[scope.awesome.list.length-1].list, scope.awesome.filter
            );
          }
          scope.awesome.show = true;
          scope.$apply();
        });

        $input.on('keydown', function (event) {
          var keyCode = event.which || event.keyCode;

          if ((keyCode == 13 || keyCode == 9)) {
            if (scope.awesome.suggestions[scope.awesome.select][scope.awesome.childrens]) {
              scope.awesome.list.push({
                name: scope.awesome.suggestions[scope.awesome.select][scope.awesome.filter],
                list: scope.awesome.suggestions[scope.awesome.select][scope.awesome.childrens]
              });
              $input.html('');

              $timeout(function () {
                $input.focus();
              });
            }
          }

          if (keyCode == 40) {
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select + 1) % scope.awesome.suggestions.length;
          } else if (keyCode == 38){
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select - 1) > -1 ?
              scope.awesome.select - 1 :
              scope.awesome.suggestions.length - 1;
          }

          if (keyCode == 8 && $input.val() === '') {
            if (scope.awesome.list.length > 1) {
              event.preventDefault();
              scope.awesome.list.splice(scope.awesome.list.length - 1, 1);
            }
          }

          scope.$apply();
        });

        $input.on('focusout', function () {
          if ($input.html() === '') {
            $input.append($placeholder);
          }
          scope.awesome.show = false;
          scope.$apply();
        });
      }
    };
  });
