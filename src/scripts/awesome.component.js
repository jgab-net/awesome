'use strict';

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

/** @namespace scope.awesome */

angular
  .module('netAwesome', [])
  .directive('netAwesome', function ($parse, $timeout, $document, AwesomeService) {
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
        alias:'@',
        itemHeight: '@?',
        sortItems:'&?'
      },
      controller: function ($scope, $element, $attrs) {
        this.filter = this.filter || 'label';
        this.placeholder = this.placeholder || 'search...';
        this.select = 0;
        this.cacheKey = this.cacheKey || '_id';
        this.father = undefined;
        this.addingItem = false;
        var expression = this.base.match( /^\s*(\w+)\s+in\s+([\w.]+)\s*$/i );
        if (!expression) {
          throw(new Error("list only supports ITEM in COLLECTION syntax."));
        }
        this.item = expression[1];
        this.list = [{
          name: undefined,
          list: AwesomeService.flatTree(
              $parse(expression[2])($scope.$parent),
              angular.isUndefined($attrs.sortItems) === false? function (a,b) {

            return this.sortItems({a:a, b:b});
          }.bind(this) : undefined)
        }];

        this.refreshList = function (newList) {
          var listBefore = this.list
          this.list = [{
          name: undefined,
          list: AwesomeService.flatTree(
              newList,
              angular.isUndefined($attrs.sortItems) === false? function (a,b) {

            return this.sortItems({a:a, b:b});
          }.bind(this) : undefined)
          }]
          if (listBefore[3]) {
            var item1 = listBefore[1],
              item2 = listBefore[2],
              item3 = listBefore[3];
              item3.list = newList
              this.list.push(item1);
              this.list.push(item2);
              this.list.push(item3);
          } else if (listBefore[2]) {
            var item1 = listBefore[1],
              item2 = listBefore[2];
              item2.list = newList
              this.list.push(item1);
              this.list.push(item2);
          } else if (listBefore[1]) {
            var item1 = listBefore[1];
              item1.list = newList

              this.list.push(item1);
          };
          console.log(this.list)
        }
        this.active = function () {
          if (this.suggestions[this.select] &&
              this.suggestions[this.select][this.childrens]) {
            $element.find('.aw-input').val('');

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
              father =
                this.list[0].list.filter(function (item) {
                  return item[this.cacheKey] == child.parent;
                }.bind(this))[0] ||
                this.list.find(function (list) {
                  return !!list.item;
                }).item;
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
              return item[this.cacheKey] == child.parent;
            }.bind(this))[0][this.childrens].push(item);
          }
        };

        this.extern = {
          addItem: function (item) {
            this.addingItem = true;
            this.addItem(item);
            if (this.list.length >= 2) {
              for (var i = this.list.length - 1; i >= 0; i--) {
                if (this.list[i].item && this.list[i].item[this.childrens].length > 0) {
                  this.list.splice(i+1, this.list.length-i, {
                    name: item.label,
                    item: item,
                    list: []
                  });
                  break;
                }
              }
            }
            $document.find('#preAdd').modal('hide');

          }.bind(this),
          clear: function (){
            this.list.splice(1, this.list.length-1);
          }.bind(this),
          refreshList: function (newList) {
            this.refreshList(newList)
          }.bind(this)
        };
      },
      link: function (scope, element, attr, ngModel, $transclude) {
        if (scope.awesome.alias)
          scope.$parent[scope.awesome.alias] = scope.awesome.extern || {};
        var $input = element.find('.aw-input');
        var $list = element.find('.aw-list');
        var $modal = element.find('#preAdd');

        $modal.appendTo(angular.element('body'));

        scope.awesome.cancelFilter = function (index) {
          scope.awesome.list.splice(index, this.list.length-index);
          scope.awesome.focus();
        };

        scope.awesome.focus = function () {
          $timeout(function () {
            $input.focus();
          });
        };

        scope.$watchCollection('awesome.suggestions', function (collection) {
          if (!collection) return;

          var transclude = function (clone) {
            if (angular.isUndefined(attr.itemHeight) === false){

              clone.height(scope.awesome.itemHeight);
            }
            $list.append(AwesomeService.cache.store(collection[i][scope.awesome.cacheKey], clone, isolateScope));

            var $item = angular.element($list.children()[i]);

            if (i < scope.awesome.limit) {
              $list.height(($item.outerHeight()*(i+1))-i);
            }
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
          var value = $input.val();
          scope.show = true;
          scope.awesome.suggestions = AwesomeService.filter(
            scope.awesome.list[scope.awesome.list.length-1].list, scope.awesome.filter, value
          );
          scope.awesome.select = 0;
          scope.$apply();
        });

        $input.on('keydown', function (event) {
          var keyCode = event.which || event.keyCode;

          if ((keyCode == 13 || keyCode == 9)) {
            if (scope.awesome.active()) {
              event.preventDefault();
              $input.val('');
            } else if($input.val() !== '' && angular.isUndefined(attr.getItem) === false) {
              if (scope.awesome.preAddItem($input.val())) {
                event.preventDefault();
                $input.val('');
                $modal.modal('show');
              }
            }
          }

          if (keyCode == 40) {
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select + 1) % scope.awesome.suggestions.length;

            if (scope.awesome.select >= scope.awesome.limit/2) {
              $list[0].scrollTop = $list[0].scrollTop + angular.element('.aw-item.active').outerHeight() - 1;
            } else if (scope.awesome.select === 0){
              $list[0].scrollTop = 0;
            }

          } else if (keyCode == 38){
            event.preventDefault();
            scope.awesome.select = (scope.awesome.select - 1) > -1 ?
              scope.awesome.select - 1 :
              scope.awesome.suggestions.length - 1;

            if (scope.awesome.select === scope.awesome.suggestions.length -1) {
              $list[0].scrollTop = scope.awesome.select * angular.element('.aw-item.active').outerHeight();
            } else if (scope.awesome.select < (scope.awesome.suggestions.length-1)-scope.awesome.limit/2) {
              $list[0].scrollTop = $list[0].scrollTop - angular.element('.aw-item.active').outerHeight() + 1;
            }
          }

          if (keyCode == 8 && $input.val() === '') {
            if (scope.awesome.list.length > 1) {
              event.preventDefault();
              scope.awesome.list.splice(scope.awesome.list.length - 1, 1);
            }
          }

          if (keyCode == 27) {
            scope.show = false;
            $input.trigger('blur');
          }

          scope.$apply();
        });

        $list.on('mouseover', function () {
          scope.hover = $list.children().length > 0;
          scope.$apply();
        });

        $list.on('mouseleave', function () {
          scope.hover = false;
          scope.$apply();
        });

        $input.on('focusout', function () {
          scope.show = false;
          scope.$apply();
        });

        $input.on('focusin', function () {
          var value = $input.val();
          scope.awesome.suggestions = AwesomeService.filter(
              scope.awesome.list[scope.awesome.list.length-1].list, scope.awesome.filter, value
          );
          $timeout(function (){
            scope.show = $list.children().length > 0;
          });
          scope.$apply();
        });

        $modal.on('hide.bs.modal', function () {
          if (!scope.awesome.addingItem) {
            scope.awesome.list.splice(scope.awesome.list.length - 1, 1);
            scope.awesome.father = undefined;
          }
          scope.awesome.addingItem = false;
        });

        $modal.on('show.bs.modal', function () {
          scope.awesome.father = scope.awesome.deductFather();
        });

        scope.$watch('show', function (){
          if (scope.show) {
            $list.css({
              left: element.css('left'),
              width: element.css('width')
            });
          }
        });
      }
    };
  });
