(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProductView3DService', ProductView3DService);

        ProductView3DService.$inject = ['$http', 'Constants'];
    function ProductView3DService($http, Constants) {
        var service = {};
        var MSG = "MSG";        
        
        
        service.test = test;

        function test() {
            return "ProductView3DService -> test -> " + MSG;            
        }

        return service;     

      
    }

})();
