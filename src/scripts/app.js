'use strict';

angular
  .module('demo', ['awesome'])
  .controller('MainController', function (Dictionary) {

    this.list = Dictionary.query();

    this.test = function () {
      this.list.push ({
        "_id":"5532fdef4a8f7cd53c0fdc35",
        "parent":"5532fdef4a8f7cd53c0fdc33",
        "label":"TEST TEST TEST",
        "name":"test",
        "__v":0,
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
        "id":"5532fdef4a8f7cd53c0fdc35"
      });

    }.bind(this);
  });
