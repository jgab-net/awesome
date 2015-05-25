'use strict';

angular
  .module('awesome')
  .service('AwesomeService', function ($compile) {

    this.flatTree = function (items) {

      return (function flat (items) {
        var results = [];
        for (var i=0, l=items.length; i<l;i++) {
          results.push(items[i]);
          if (items[i].items) results.push.apply(results, flat(items[i].items));
        }
        return results;
      })(items);

    };

    this.filter = function (list, key, value) {
      value = value || '';
      return list.filter(function (item) {
        return item[key].indexOf(value) === 0;
      });

    };

    this.cache = {
      stored: {},
      updateIndex: function (key, i){
        this.stored[key].scope.$index = i;
      },
      store: function (key, clone, scope) {
        this.stored[key] = {
          clone: clone,
          scope: scope,
          clear: false
        };
        return this.stored[key].clone;
      },
      exists: function (key) {
        if (this.stored[key]) {
          this.stored[key].clear = false;
          return true;
        }
        return false;
      },
      clear: function () {
        if (this.stored) {
          for (var key in this.stored){
            if (this.stored[key].clear) {
              this.stored[key].clone.remove();
              this.stored[key].scope.$destroy();
              delete this.stored[key];
            } else {
              this.stored[key].clear = true;
            }
          }
        }
      }
    }

  });
