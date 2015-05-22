'use strict';

angular
  .module('awesome')
  .service('AwesomeService', function () {

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

  });
