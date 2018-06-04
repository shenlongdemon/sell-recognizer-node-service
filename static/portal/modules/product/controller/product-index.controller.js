(function () {
	'use strict';
	angular
            .module('app')
            .controller('ProductIndexController', ProductIndexController);
			ProductIndexController.$inject = ['$rootScope', '$scope'];
	function ProductIndexController($rootScope, $scope) {
	    $rootScope.title = "ProductIndexController Index Controller";	
		function initController() {
			
		}
		initController();
		
	}

})();
