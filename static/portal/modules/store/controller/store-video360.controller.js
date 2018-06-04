(function () {
	'use strict';
	angular
            .module('app')
            .controller('StoreVideo360Controller', StoreVideo360Controller);
			StoreVideo360Controller.$inject = ['$rootScope', '$scope', '$route', 'StoreService'];
	function StoreVideo360Controller($rootScope, $scope, $route, StoreService) {
        $rootScope.title = "StoreVideo360Controller Page Controller";	
        
		function initController() {
            var storeId = $route.current.params.id;
            StoreService.getStoreById(storeId).then(function(res){
                if (res.data.Status == 1){
                    var store = res.data.Data;
                    $("#StoreVideo360Container").append(store.video360);
                }
            });
		}
		initController();
		
	}

})();