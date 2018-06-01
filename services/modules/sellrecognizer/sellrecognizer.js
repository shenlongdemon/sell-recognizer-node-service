
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
    console.log("begin sellrecognizer controller getItems pageNum " + pageNum + " pageSize " + pageSize);
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10 : size = size;

    sellService.getItems(num, size)
        .then(function (res) {
            console.log("sellrecognizer controller getItems " + res.length);
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
var getSelledItems = function (pageNum, pageSize) {
    console.log("begin sellrecognizer controller getSelledItems ");
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10 : size = size;

    sellService.getSelledItems(num, size)
        .then(function (res) {
            console.log("sellrecognizer controller getSelledItems " + res);
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
var updateUser = function (data) {
    console.log("begin sellrecognizer controller updateUser ");
    var userId = data.id;
    var user = data.user;
    var deferred = q.defer();
    sellService.updateUser(userId, user)
        .then(function (res) {
            console.log("sellrecognizer controller updateUser " + res);
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
var getItemByQRCode = function (qrCode) {
    console.log("begin sellrecognizer controller getItemByQRCode " + qrCode.code);
    var deferred = q.defer();

    sellService.getItemByQRCode(qrCode.code, qrCode.coord)
        .then(function (item) {
            console.log("sellrecognizer controller getItemByQRCode " + item);
            var res = {
                Data: item,
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

var publishSell = function (obj) {
    console.log("begin sellrecognizer controller publishSell ");
    var deferred = q.defer();

    sellService.publishSell(obj.itemId, obj.userInfo)
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
    var deferred = q.defer();
    var itemId = data.itemId;
    var buyerInfo = data.buyerInfo;
    sellService.payment(itemId, buyerInfo).then(function (item) {
        var res = {
            Data: item,
            Message: item != null ? "" : "Cannot pay",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
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
var getProductsByCodes = function (names) {

    console.log("begin sellrecognizer controller getProductsByCodes " + names.length);
    var deferred = q.defer();
    sellService.getProductsByCodes(names).then(function (item) {
        console.log("begin sellrecognizer controller getProductsByCodes return " + item.length);
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getProductsByBluetoothCodes = function (data) {
    var devices = data.devices;
    var coord = data.coord;
    console.log("begin sellrecognizer controller getProductsByBluetoothCodes " + devices.length);
    var deferred = q.defer();
    sellService.getProductsByBluetoothCodes(devices, coord).then(function (items) {
        console.log("begin sellrecognizer controller getProductsByBluetoothCodes return " + items.length);
        var res = {
            Data: items,
            Message: "",
            Status: 1
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getDescriptionQRCode = function (qrCode) {

    var deferred = q.defer();
    sellService.getDescriptionQRCode(qrCode.code).then(function (item) {
        console.log("begin sellrecognizer controller getDescriptionQRCode return " + item);
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var genCode = function (data) {

    var deferred = q.defer();
    sellService.genCode(data.str).then(function (item) {
        console.log("begin sellrecognizer controller genCode return " + item);
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var getProductsByCategory = function (categoryId, pageNum, pageSize) {
    console.log("begin sellrecognizer controller getProductsByCategory " + categoryId);
    var deferred = q.defer();
    sellService.getProductsByCategory(categoryId, pageNum, pageSize).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getItemsByCodes = function (names) {

    console.log("begin sellrecognizer controller getItemsByCodes " + names.length);
    var deferred = q.defer();
    sellService.getItemsByCodes(names).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var confirmReceiveItem = function (id) {

    console.log("begin sellrecognizer controller confirmReceiveItem " + id);
    var deferred = q.defer();
    sellService.confirmReceiveItem(id).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var cancelSell = function (id) {

    console.log("begin sellrecognizer controller cancelSell " + id);
    var deferred = q.defer();
    sellService.cancelSell(id).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    }).catch((ex) => {
        var res = {
            Data: ex,
            Message: ex.Message,
            Status: 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getStores = function () {

    console.log("begin sellrecognizer controller getStores ");
    var deferred = q.defer();
    sellService.getStores().then(function (items) {
        var res = {
            Data: items,
            Message: "",
            Status: 1
        };
        deferred.resolve(res);
    }).catch((ex) => {
        var res = {
            Data: ex,
            Message: ex.Message,
            Status: 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var saveStorePosition = function (stores) {
    console.log("begin sellrecognizer controller saveStorePosition " + stores.length);
    var deferred = q.defer();
    sellService.saveStorePosition(stores).then(function (re) {
        var res = {
            Data: re,
            Message: "",
            Status: 1
        };
        deferred.resolve(res);
    }).catch((ex) => {
        var res = {
            Data: ex,
            Message: ex.Message,
            Status: 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var updateOMIDCODE = function (data) {

    console.log("begin sellrecognizer controller updateOMIDCODE ");
    var deferred = q.defer();
    var code = sellService.updateOMIDCODE(data);
    var res = {
        Data: code,
        Message: "",
        Status:1
    };
    deferred.resolve(res);
    return deferred.promise;
}
var getItemInsideStore = function (storeId, position) {

    console.log("begin sellrecognizer controller getItemInsideStore storeId " + storeId + " position " + position);
    var deferred = q.defer();
    sellService.getItemInsideStore(storeId, position).then(function (re) {
        var res = {
            Data: re,
            Message: "",
            Status: 1
        };
        deferred.resolve(res);
    }).catch((ex) => {
        var res = {
            Data: ex,
            Message: ex.Message,
            Status: 0
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
        publishSell: publishSell,
        getSelledItems: getSelledItems,
        getItemByQRCode: getItemByQRCode,
        updateUser: updateUser,
        getItemsByCodes: getItemsByCodes,
        getProductsByCodes: getProductsByCodes,
        confirmReceiveItem: confirmReceiveItem,
        getProductsByCategory: getProductsByCategory,
        cancelSell: cancelSell,
        getProductsByBluetoothCodes: getProductsByBluetoothCodes,
        getDescriptionQRCode: getDescriptionQRCode,
        updateOMIDCODE: updateOMIDCODE,
        genCode: genCode,
        getStores: getStores,
        saveStorePosition:saveStorePosition,
        getItemInsideStore:getItemInsideStore,
    }