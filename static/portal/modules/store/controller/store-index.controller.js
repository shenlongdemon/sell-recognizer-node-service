(function () {
	'use strict';
	angular
            .module('app')
            .controller('StoreIndexController', StoreIndexController);
			StoreIndexController.$inject = ['$rootScope', '$scope'];
	function StoreIndexController($rootScope, $scope) {
	    $rootScope.title = "Test Index Controller";	
		function initController() {
			
		}
		initController();
		
	}

})();
