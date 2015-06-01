'use strict';

/** @namespace scope.awesome */

angular
  .module('netAwesome', [])
  .directive('netAwesome', function ($parse, $timeout, AwesomeService) {
    return {
      restrict: 'E',
      require: '^ngModel',
      replace: true, //DEPECRATED
      templateUrl: 'views/awesome.component.html',
      controllerAs: 'awesome',
      bindToController: true,
      transclude: true,
      scope: {
        placeholder: '@?',
        base: '@list',
        filter: '@',
        childrens: '@',
        cacheKey:'@',
        getItem:'&?',
        limit:'=',
        alias:'@'
      },
      controller: function ($scope, $element) {
        this.filter = this.filter || 'label';
        this.placeholder = this.placeholder || 'search...';
        this.select = 0;
        this.cacheKey = this.cacheKey || '_id';
        this.show = false;
        this.father = undefined;

        var expression = this.base.match( /^\s*(\w+)\s+in\s+([\w.]+)\s*$/i );
        if (!expression) {
          throw(new Error("list only supports ITEM in COLLECTION syntax."));
        }

        this.item = expression[1];
        this.list = [{
          name: undefined,
          list: AwesomeService.flatTree($parse(expression[2])($scope.$parent))
        }];

        this.active = function () {
          if (this.suggestions[this.select] &&
              this.suggestions[this.select][this.childrens]) {
            this.list.push({
              name: this.suggestions[this.select][this.filter],
              item: this.suggestions[this.select],
              list: this.suggestions[this.select][this.childrens]
            });
            return true;
          }
          return false;
        };

        this.preAddItem = function (text) {
          if(this.list.length > 1 && !this.list[this.list.length-1].add ) {
            this.list.push({
              name: text,
              list: [],
              add: true
            });
            return true;
          }
          return false;
        };

        this.deductFather = function () {
          var father = undefined;
          if (this.list.length > 1) {

            var child = undefined;
            for (var i = this.list.length - 1; i >= 0; i--) {
              if (this.list[i].item) {
                if (this.list[i].item[this.childrens].length > 0) {
                  father = this.list[i].item;
                  break;
                } else {
                  child = child || this.list[i].item;
                }
              }
            }
            if (!father) {
              father = this.list[0].list.filter(function (item) {
                return item[this.cacheKey] = child.parent;
              }.bind(this))[0];
            }
          }
          return father;
        };

        this.requestItem = function () {
          this.getItem({
            name: this.list[this.list.length-1].name,
            father: this.father
          });
        };

        this.addItem = function (item) {
          this.list[0].list.push(item);
          if (this.father) {
            this.father[this.childrens].push(item);
            this.father = undefined;
          } else {
            this.list[0].list.filter(function (item) {
              return item[this.cacheKey] = child.parent;
            }.bind(this))[0][this.childrens].push(item);
          }
        };

        this.extern = {
          addItem: function (item) {
            this.addItem(item);
            if (this.list.length >= 2) {
              for (var i = this.list.length - 1; i >= 0; i--) {
                if (this.list[i].item) {
                  console.log(this.list[i].item);
                  this.list.splice(i, this.list.length-i, {
                    name: item.label,
                    item: item,
                    list: []
                  });
                  break;
                }
              }
            }

            $element.find('#preAdd').data('add', true).modal('hide');

          }.bind(this)
        };
      },
      link: function (scope, element, attr, ngModel, $transclude) {
        if (scope.awesome.alias)
          scope.$parent[scope.awesome.alias] = scope.awesome.extern || {};

        var $input = element.find('.aw-input');
        var $placeholder = element.find('.aw-placeholder');
        var $list = element.find('.aw-list');
        var $modal = element.find('#preAdd');

        $modal.appendTo(angular.element('body'));

        scope.awesome.cancelFilter = function (index) {
          scope.awesome.list.splice(index, this.list.length-index);
          $timeout(function () {
            $input.focus();
          });
        };

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

          if (collection.length > 1 && collection[collection.length-1].item) {
            ngModel.$setViewValue(collection[collection.length-1].item);
          } else{
            ngModel.$setViewValue(undefined);
          }

          scope.awesome.select = 0;
        });

        $input.on('input', function () {
          var value = $input.html();
          scope.awesome.show = true;
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

        $list.on('mouseenter', function () {
          scope.awesome.hover = true;
        });

        $list.on('mouseleave', function () {
          scope.awesome.hover = false;
        });

        $input.on('keydown', function (event) {
          var keyCode = event.which || event.keyCode;

          if ((keyCode == 13 || keyCode == 9)) {
            if (scope.awesome.active()) {
              event.preventDefault();
              $input.html('');
              /*$timeout(function () {
                $input.focus();
              });*/
            } else if($input.html() !== '' && angular.isUndefined(attr.getItem) === false) {
              if (scope.awesome.preAddItem($input.html())) {
                event.preventDefault();
                $input.html('');
                $modal.modal('show');
              }
            } else if(keyCode == 13) {
              event.preventDefault();
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

          if (keyCode == 27) {
            scope.awesome.show = false;
          }

          scope.$apply();
        });

        $input.on('focusout', function () {
          if ($input.html() === '') {
            $input.append($placeholder);
          }
          if (!scope.awesome.hover) {
            scope.awesome.show = false;
            scope.$apply();
          }
        });

        $modal.on('hide.bs.modal', function () {

          if ($modal.data('add') === false) {
            scope.awesome.list.splice(scope.awesome.list.length -1, 1);
            scope.awesome.father = undefined;
          }
          $modal.data('add', false);
          $timeout(function () {
            $input.focus();
          });
        });

        $modal.on('show.bs.modal', function () {
          scope.awesome.father = scope.awesome.deductFather();
        });

        scope.$watch('awesome.show', function () {
          if(scope.awesome.show){
              //TODO sacar el 41.
            $list.css({
              left: element.css('left'),
              width: element.css('width'),
              height: (41*scope.awesome.limit-9)+'px'
            });
          }
        });
      }
    };
  });
