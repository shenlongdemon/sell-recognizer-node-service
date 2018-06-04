(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProductService', ProductService);

    ProductService.$inject = ['$http', 'Constants'];
    function ProductService($http, Constants) {
        var service = {};
        var MSG = "MSG";


        service.test = test;
        service.getItemById = getItemById;
        function test() {
            return "ProductView3DService -> test -> " + MSG;
        }
        function getItemById(id) {
            var url = Constants.API_BASE.replace("{service}", "sellrecognizer").replace("{action}", "getItemById") + "?id=" + id;
            return $http.get(url);
        }
        return service;


    }

})();
