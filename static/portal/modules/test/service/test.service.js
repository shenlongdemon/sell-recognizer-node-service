(function () {
    'use strict';

    angular
        .module('app')
        .factory('TestService', TestService);

        TestService.$inject = ['$http', 'Constants'];
    function TestService($http, Constants) {
        var service = {};
        var MSG = "MSG";        
        
        
        service.test = test;

        function test() {
            return "TestService -> test -> " + MSG;            
        }

        return service;     

      
    }

})();
