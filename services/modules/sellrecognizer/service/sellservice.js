var q = require('q');
var sellrepo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
var lzjs = require('lzjs');

var LZString = require('lz-string');
var MAX_DIGIT = 8;
function convertToNum(string) {
    var code = "";
    Array.from(string).map((c, key) => {
        try {
            _.map(STRS, function (STR, index) {
                var idx = STR.indexOf(c);
                if (idx > -1) {
                    code += index + "" + idx;
                }
            });
        } catch (e) {
            console.log("convertToNum Error " + e);
        }
    });
    console.log("convertToNum " + string + " to " + code);
    return code;
}
function convertToString(string) {
    var code = "";
    var i = 0;
    try {
        for (i; i < string.length / 2; i++) {
            var str = string.substr(i * 2, 2);

            var idxStrs = parseInt(str.charAt(0));
            var idxStr = parseInt(str.charAt(1));
            //console.log("convertToString " + str + " to " + STRS[idxStrs].charAt(idxStr));
            code += STRS[idxStrs].charAt(idxStr);
        }
    }
    catch (e) {
        console.log("convertToString Error " + string + " to " + JSON.stringify(e));

    }
    console.log("convertToString " + string + " to " + code);
    return code;
}
function getMAXString(string) {
    try {
        var str = string.length > MAX_DIGIT ? string.substr(0, MAX_DIGIT - 1) : string;
        return str;
    } catch (e) {
        console.log("getMAXString Error " + e);
        return "";
    }
}

function genInfoCode(action, owner) {
    console.log("sellservice genInfoCode " + action + " " + JSON.stringify(owner));

    var allStr = " " + action + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var code = convertToNum(allStr);
    console.log("genPersonalCode " + code);
    return code;

}

function genItemCode(item) {
    var category = getMAXString(item.category.value);
    var name = getMAXString(item.name);

    var allStr = category + " " + name;
    var code = convertToNum(allStr);
    console.log("genItemCode " + code);
    return code;

}
function autoUpdateAllOwnerCode(info) {
    var code = genInfoCode(info)
    sellrepo.updateAllOwnerCode(OMID_CODE);
}

var updateOMIDCODE = function (info) {
    var OM_C = genInfoCode('[TOKEN]', info);
    global.OMID_CODE = OM_C;
    updateAllOwnerCode();
    var description = convertToString(OM_C);
    var res = {
        code: OM_C,
        str: description
    };
    return res;
};
var updateAllOwnerCode = function () {
    return sellrepo.updateAllOwnerCode(global.OMID_CODE);
}


var updateUser = function (userId, usertoUpdate) {
    return sellrepo.updateUser(userId, usertoUpdate);
};
var getItemById = function (id) {
    return sellrepo.getItemById(id);
};
var getItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    return sellrepo.getItemsByOwnerId(ownerId, pageNum, pageSize);
};
var getItems = function (pageNum, pageSize) {
    return sellrepo.getItems(pageNum, pageSize);
};
var getSelledItems = function (pageNum, pageSize) {
    return sellrepo.getSelledItems(pageNum, pageSize);
};

var getItemBySellSectionId = function (sellSectionId) {
    return sellrepo.getItemBySellSectionId(sellSectionId);
};
var getCategories = function () {
    return sellrepo.getCategories();
};
var getItemByQRCode = function (qrCode) {
    var qr = lzjs.decompress(qrCode);
    return sellrepo.getItemByQRCode(qr);
};
var insertItem = function (item) {
    item.id = uuid.v4();
    var itemCode = genItemCode(item);
    var ownerCode = genInfoCode("[Product]", item.owner)
    item.code = itemCode + ownerCode;
    item.bluetoothCode = itemCode + ownerCode;
    item.owner.code = ownerCode;
    item.section = { active: true, code: "", history: [] };
    item.section.history.push(item.owner);
    item.buyerCode = "";
    item.sellCode = "";
    item.buyer = undefined;
    console.log("owner code " + ownerCode + " for " + convertToString(ownerCode));
    return sellrepo.insertItem(item);
};
var payment = function (itemId, buyerInfo) {
    var buyerCode = genInfoCode("[Buy]", buyerInfo);
    buyerInfo.code = buyerCode;
    var deferred = q.defer();
    sellrepo.getItemById(itemId).then(function (item) {
        item.buyer = buyerInfo;
        item.buyerCode = item.section.code + buyerCode;
        sellrepo.updateItem(item).then((res) => {
            deferred.resolve(res);
        });
    });
    return deferred.promise;
};
var confirmReceiveItem = function (itemId) {
    var deferred = q.defer();
    sellrepo.getItemById(itemId).then(function (item) {
        item.code = genItemCode(item) + genInfoCode("[Own]", item.buyer)
        item.section.history.push(item.buyer);
        item.owner = item.buyer;
        item.buyer = undefined;
        item.buyerCode = "";
        item.sellCode = "";
        sellrepo.updateItem(item).then((res) => {
            deferred.resolve(res);
        });
    });
    return deferred.promise;
};
var publishSell = function (itemId, userInfoAtSellTime) {
    global.OMID_CODE = convertToNum(uuid.v4());
    var userInfoCodeAtSellTime = genInfoCode("[Sell]", userInfoAtSellTime)
    return sellrepo.publishSell(itemId, userInfoCodeAtSellTime);
};
var login = function (phone, password) {
    return sellrepo.login(phone, password);
}
var getItemsByCodes = function (names) {
    return sellrepo.getItemsByCodes(names);
}
var getProductsByCodes = function (names) {
    return sellrepo.getProductsByCodes(names);
}
var getProductsByBluetoothCodes = function (names) {
    return sellrepo.getProductsByBluetoothCodes(names);
}
var getDescriptionQRCode = function (qrCode) {
    var deferred = q.defer();

    var str = convertToString(qrCode);
    deferred.resolve(str);
    return deferred.promise;
}
var getProductsByCategory = function (categoryId, pageNum, pageSize) {
    return sellrepo.getProductsByCategory(categoryId, pageNum, pageSize);
}
var cancelSell = function (id) {
    return sellrepo.cancelSell(id);
}
module.exports =
    {
        insertItem: insertItem,
        getItemById: getItemById,
        getItemsByOwnerId: getItemsByOwnerId,
        getItemBySellSectionId: getItemBySellSectionId,
        getCategories: getCategories,
        updateOMIDCODE: updateOMIDCODE,
        updateAllOwnerCode: updateAllOwnerCode,
        payment: payment,
        login: login,
        getItems: getItems,
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
    }