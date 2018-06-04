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

        function loadStores() {
            HomeService.getStores().then(function (res) {
                if (res.data.Status == 1) {
                    $scope.stores = res.data.Data;
                }
            });
        }
        function loadItems() {
            HomeService.getItems().then(function (res) {
                if (res.data.Status == 1) {
                    $scope.items = res.data.Data;
                }
            });
        }
        $scope.selectStore = function (store) {
            $scope.selectedStore = store;
        }
        $scope.selectItem = function (item) {
            $scope.selectedItem = item;
            $("#set-position-form").dialog("open");
        }
        $scope.removePosition = function(item){
            $scope.selectedStore.items = $.grep($scope.selectedStore.items, function(e,i){
                return e.id != item.id;
            });            
        }
        $scope.setPositionForSelectedItem = function (position) {
            $scope.selectedStore.items = $scope.selectedStore.items || [];

            if ($.grep($scope.selectedStore.items, function (n, i) {
                return n.id == $scope.selectedItem.id;
            }).length > 0) {
                alert("Item is set position");
            }
            else if ($.grep($scope.selectedStore.items, function (n, i) {
                return n.position == position;
            }).length > 0) {
                alert("Position is set for item.");
            }
            else {
                $scope.selectedStore.items.push({
                    id: $scope.selectedItem.id,
                    name: $scope.selectedItem.name,
                    position: position
                });
                $scope.hasChanged = true;
                $scope.$apply();
            }
        }
        $scope.setVideo360 = function(store){
            $scope.selectedStore = store;
            $("#set-video-360-form").dialog("open");
            $("#video360").val($scope.selectedStore.video360);
        }
        $scope.setView3D = function(item){
            $scope.selectedItem = item;
            $("#set-view-3d-form").dialog("open");
            $("#view3d").val($scope.selectedItem.view3d);
        }
        $scope.setView3DForSelectedItem = function(view3d){
            $scope.selectedItem.view3d = view3d;

        }
        $scope.setVideo360ForSelectedStore = function(video360){
            $scope.selectedStore.video360 = video360;
        }
        $scope.save = function () {
            var i = 0;
            HomeService.save($scope.stores).then(function (res) {
                if (res.data.Status == 1) {
                    i += 1;
                    if(i == 2){
                        location.reload();
                    }
                }
                else {
                    alert("Error");
                }
            });
            HomeService.saveItems($scope.items).then(function (res) {
                if (res.data.Status == 1) {
                    i += 1;
                    if(i == 2){
                        location.reload();
                    }
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
