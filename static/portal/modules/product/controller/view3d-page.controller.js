(function () {
    'use strict';
    angular
        .module('app')
        .controller('ProductView3DPageController', ProductView3DPageController);
    ProductView3DPageController.$inject = ['$rootScope', '$scope', '$route', 'ProductService', 'ProductView3DService'];
    function ProductView3DPageController($rootScope, $scope, $route, ProductService, ProductView3DService) {
        $rootScope.title = "ProductView3DPageController Page Controller";
        function initController() {
            var productId = $route.current.params.id;
            ProductService.getItemById(productId).then(function(res){
                if (res.data.Status == 1){
                    var item = res.data.Data;
                    $("#ProductView3DPageContainer").append(item.view3d);
                }
            });
        }
        initController();

    }

})();