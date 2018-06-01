(function () {
    'use strict';

    angular
        .module('app')
        .factory('HomeService', HomeService);
    HomeService.$inject = ['$http', 'Constants'];
    function HomeService($http, Constants) {
        let SELLREG_SERVICE = "sellrecognizer"
        var service = {};
        service.getStores = function () {
            var api = Constants.API_BASE.replace("{service}", SELLREG_SERVICE).replace("{action}", "getStores") + "";
            return $http.get(api);
        }
        service.getItems = function () {
            var api = Constants.API_BASE.replace("{service}", SELLREG_SERVICE).replace("{action}", "getItems") + "?pageNum=1&pageSize=1000";
            return $http.get(api);
        }
        service.save = function (store) {
            var api = Constants.API_BASE.replace("{service}", SELLREG_SERVICE).replace("{action}", "saveStorePosition");
            return $http.post(api, store);
        }
        return service;

    }

})();
