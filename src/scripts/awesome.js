'use strict';

/** @namespace scope.awesome */

angular
  .module('awesome', [])
  .directive('netAwesome', function ($parse, $timeout, AwesomeService) {
    return {
      restrict: 'E',
      require: '^ngModel',
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
        cacheKey:'@',
        limit:'='
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

        this.active = function (event) {
          if (this.suggestions[this.select] &&
              this.suggestions[this.select][this.childrens]) {
            if(event) event.preventDefault();
            this.list.push({
              name: this.suggestions[this.select][this.filter],
              list: this.suggestions[this.select][this.childrens]
            });
            return true;
          }
          return false;
        };
      },
      link: function (scope, element, attrs, ngModel, $transclude) {
        var $input = element.find('.aw-input');
        var $placeholder = element.find('.aw-placeholder');
        var $list = element.find('.aw-list');

        scope.$watchCollection('awesome.suggestions', function (collection) {
          if (!collection) return;

          var transclude = function (clone) {
            $list.append(AwesomeService.cache.store(collection[i][scope.awesome.cacheKey], clone, isolateScope));
          };

          for (var i=0, l=collection.length; i<l; i++) {
            var isolateScope = scope.$new(true);
            isolateScope[scope.awesome.item] = collection[i];
            isolateScope.$index = i;
            $transclude(isolateScope, transclude);
          }

          AwesomeService.cache.clearAll();
        });

        scope.$watchCollection('awesome.list', function (collection) {
          scope.awesome.suggestions = collection[collection.length-1].list;
          scope.awesome.select = 0;
        });

        $input.on('input', function () {
          var value = $input.html();
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list[scope.awesome.list.length-1].list, scope.awesome.filter, value
          );
          scope.awesome.select = 0;
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
            if (scope.awesome.active(event)) {
              $input.html('');
              $timeout(function () {
                $input.focus();
              });
            }
          }

          if (keyCode == 40) {
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select + 1) % scope.awesome.suggestions.length;

            if (scope.awesome.select >= scope.awesome.limit/2) {
              $list[0].scrollTop = $list[0].scrollTop + angular.element('.aw-item.active').height() + 21;
            } else if (scope.awesome.select === 0){
              $list[0].scrollTop = 0;
            }

          } else if (keyCode == 38){
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select - 1) > -1 ?
              scope.awesome.select - 1 :
              scope.awesome.suggestions.length - 1;

            if (scope.awesome.select === scope.awesome.suggestions.length -1) {
              //TODO sacar el 41.
              $list[0].scrollTop = scope.awesome.select * 41;
            } else if (scope.awesome.select < (scope.awesome.suggestions.length-1)-scope.awesome.limit/2) {
              $list[0].scrollTop = $list[0].scrollTop - angular.element('.aw-item.active').height() - 21;
            }
          }

          if (keyCode == 8 && $input.html() === '') {
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

        scope.$watch('awesome.show', function () {
          if(scope.awesome.show){
            $timeout(function (){
              //TODO sacar el 41.
              $list.css({
                left: element.css('left'),
                width: element.css('width'),
                height: (41*scope.awesome.limit-9)+'px'
              });
            });
          }
        });
      }
    };
  });
