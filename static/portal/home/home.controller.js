(function () {
    'use strict';
    angular
            .module('app')
            .controller('HomeController', HomeController);
    HomeController.$inject = ['$rootScope', '$scope', 'HomeService'];
    function HomeController($rootScope, $scope, HomeService) {      
        $rootScope.title = "shenlong-webutl Home";
        $scope.selectedStore = undefined;
        $scope.stores = [];
        $scope.selectedItem = undefined;
        $scope.items = [];
        $scope.hasChanged = false;
        initController();
        
        function loadStores(){
            HomeService.getStores().then(function(res){
                if (res.data.Status == 1){
                    $scope.stores = res.data.Data;
                }
            });
        }
        function loadItems(){
            HomeService.getItems().then(function(res){
                if (res.data.Status == 1){
                    $scope.items = res.data.Data;
                }
            });
        }
        $scope.selectStore = function(store){
            $scope.selectedStore = store;
        }
        $scope.selectItem = function(item){
            $scope.selectedItem = item;
            $("#dialog-form").dialog("open");
        }
        $scope.setPositionForSelectedItem = function(position){
            $scope.selectedStore.items = $scope.selectedStore.items || [];
            $scope.selectedStore.items.push({
                id: $scope.selectedItem.id,
                name:$scope.selectedItem.name,
                position: position
            });         
            $scope.hasChanged = true;
            $scope.$apply();
        }
        $scope.save = function(){
            HomeService.save($scope.stores).then(function(res){
                if (res.data.Status == 1){
                    location.reload();
                }
                else {
                    alert("Error");
                }
            });
            
        }
        function initController() {
            loadStores();
            loadItems();
         }

    }

})();
