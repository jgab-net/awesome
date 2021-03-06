'use strict';

angular
  .module('demo', ['netAwesome'])
  .controller('MainController', function ($scope, $timeout, Dictionary) {
    $scope.list = Dictionary.query();
    $scope.$watch('main.item', function () {
    });
    
    $scope.refreshList = function (newList) {
      $scope.awesome.refreshList(newList);
    }
    this.sortItem = function (a, b) {
      return a.level - b.level;
    };

    this.getItem = function (item, father) {

      $timeout(function () {
        var newItem = {
          "_id":"5532fdef4a8f7cd53c0fd312",
          label: item,
          name: item,
          "items":[],
          "flags":{
            "visible":true,
            "value":false,
            "end":false
          },
          "type":"string",
          "created":"2015-04-19T00:59:27.000Z",
          "middle":false,
          "leaf":true,
          "root":false,
          parent: father._id
        };

        $scope.awesome.addItem(newItem);
      }, 500);

    };

    this.clear = function () {
      $scope.awesome.clear();
    };

  });
