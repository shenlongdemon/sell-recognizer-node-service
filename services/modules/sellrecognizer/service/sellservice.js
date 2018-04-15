var q = require('q');
var sellrepo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
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
    for (i; i < string.length / 2; i++) {
        var str = string.substr(i * 2, 2);

        var idxStrs = parseInt(str.charAt(0));
        var idxStr = parseInt(str.charAt(1));
        //console.log("convertToString " + str + " to " + STRS[idxStrs].charAt(idxStr));
        code += STRS[idxStrs].charAt(idxStr);
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

//Dead Kjhkhjk
function genInfoCode(owner) {
    var firstName = getMAXString(owner.firstName);
    var lastName = getMAXString(owner.lastName);
    var state = getMAXString(owner.state);
    var country = getMAXString(owner.country);
    var zipCode = getMAXString(owner.zipCode);

    var allStr = " " + firstName + " " + lastName + " " + state + " " + zipCode + " " + country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C";
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
    var OMID_CODE = genInfoCode(info);
    this.updateAllOwnerCode(OMID_CODE);
    return OMID_CODE;
};
var updateAllOwnerCode = function (OMID_CODE) {
    return sellrepo.updateAllOwnerCode(OMID_CODE);
}



















var insertItem = function (item) {
    item.id = uuid.v4();
    var itemCode = genItemCode(item);
    var ownerCode = itemCode + genInfoCode(item.owner)
    item.code = itemCode;
    item.owner.code = ownerCode;
    item.section = { active: true, code: "", history:[] };
    item.buyerCode = "";
    console.log("owner code " + ownerCode + " for " + convertToString(ownerCode));
    return sellrepo.insertItem(item);
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
var getItemBySellSectionId = function (sellSectionId) {
    return sellrepo.getItemBySellSectionId(sellSectionId);
};
var getCategories = function () {
    return sellrepo.getCategories();
};

var payment = function (itemId, buyerInfo) {
    var buyerCode = genInfoCode(buyerInfo);
    buyerInfo.code = buyerCode;
    return sellrepo.getItemById(itemId).then(function (item) {

        item.section.history = item.section.history || [];
        item.section.history.push(item.owner);
        item.owner = buyerInfo;
        item.buyerCode = item.code + buyerCode;
        return sellrepo.updateItem(item);
    });
}
var login = function (phone, password) {
    return sellrepo.login(phone, password);
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
        getItems: getItems

    }