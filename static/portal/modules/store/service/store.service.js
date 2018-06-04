(function () {
    'use strict';

    angular
        .module('app')
        .factory('StoreService', StoreService);

        StoreService.$inject = ['$http', 'Constants'];
    function StoreService($http, Constants) {
        var service = {};
        var MSG = "MSG";        
        
        
        service.test = test;
        service.getStoreById = getStoreById;
        function getStoreById(id){            
            var url = Constants.API_BASE.replace("{service}", "sellrecognizer").replace("{action}", "getStoreById") + "?id=" + id;
            return $http.get(url);            
        }
        function test() {
            return "TestService -> test -> " + MSG;            
        }

        return service;     

      
    }

})();
