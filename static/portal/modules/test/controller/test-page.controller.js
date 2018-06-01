(function () {
	'use strict';
	angular
            .module('app')
            .controller('TestPageController', TestPageController);
			TestPageController.$inject = ['$rootScope', '$scope'];
	function TestPageController($rootScope, $scope) {
	    $rootScope.title = "Test Page Controller";	
		function initController() {
			
		}
		initController();
		
	}

})();