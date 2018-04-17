
/*
 * GET users listing.
 */

var q = require('q');
var _ = require('underscore');
var sellService = require("./service/sellservice");
var searchImageService = require("./service/serchimageservice");


var searchImage = function (obj) {
    console.log("begin sellrecognizer controller searchImage " + obj);
    var deferred = q.defer();

    searchImageService.searchImage(obj)
        .then(function (res) {
            console.log("sellrecognizer controller searchImage " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );
    return deferred.promise;
};
var insertItem = function (item) {
    console.log("begin sellrecognizer controller insertItem " + item);
    var deferred = q.defer();
    sellService.insertItem(item)
        .then(function (res) {
            console.log("sellrecognizer controller insertItem " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};
var getItemById = function (id) {
    console.log("begin sellrecognizer controller getItemById " + id);
    var deferred = q.defer();

    sellService.getItemById(id)
        .then(function (res) {
            console.log("sellrecognizer controller getItemById " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};
var getItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    console.log("begin sellrecognizer controller getItemsByOwnerId " + ownerId);
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10 : size = size;

    sellService.getItemsByOwnerId(ownerId, num, size)
        .then(function (res) {
            console.log("sellrecognizer controller getItemsByOwnerId " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};
var getItems = function (pageNum, pageSize) {
    console.log("begin sellrecognizer controller getItems ");
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10 : size = size;

    sellService.getItems(num, size)
        .then(function (res) {
            console.log("sellrecognizer controller getItems " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};
var getItemBySellSectionId = function (sellSectionId) {
    console.log("begin sellrecognizer controller getItemBySellSectionId " + sellSectionId);
    var deferred = q.defer();

    sellService.getItemBySellSectionId(sellSectionId)
        .then(function (res) {
            console.log("sellrecognizer controller getItemBySellSectionId " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};
var getCategories = function () {
    console.log("begin sellrecognizer controller getCategories ");
    var deferred = q.defer();

    sellService.getCategories()
        .then(function (res) {
            console.log("sellrecognizer controller getCategories " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};

var publishSell = function (itemId, userInfoAtSellTime) {
    console.log("begin sellrecognizer controller publishSell " + itemId);
    var deferred = q.defer();
    
    sellService.publishSell(itemId, userInfoAtSellTime)
        .then(function (res) {
            console.log("sellrecognizer controller publishSell " + res);
            var res = {
                Data: res,
                Message: "",
                Status: 1
            };
            deferred.resolve(res);
        }
        );

    return deferred.promise;
};

var payment = function (data) {
    var itemId = data.itemId;
    var buyerInfo = data.buyerInfo;
    return sellService.payment(itemId, buyerInfo);
}
var login = function (phone, password) {
    var deferred = q.defer();
    sellService.login(phone, password).then(function (item) {
        var res = {
            Data: item,
            Message: item != null ? "" : "Invalid phone or password",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
module.exports =
    {
        searchImage: searchImage,
        insertItem: insertItem,
        getItemById: getItemById,
        getItemsByOwnerId: getItemsByOwnerId,
        getItems: getItems,

        getItemBySellSectionId: getItemBySellSectionId,
        getCategories: getCategories,
        payment: payment,
        login: login,
        publishSell:publishSell,
    }