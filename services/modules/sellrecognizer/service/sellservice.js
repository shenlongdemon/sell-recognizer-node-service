var q = require('q');
var sellrepo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
var LZString = require('lz-string');
var OMID_CODE = "";
var MAX_DIGIT = 8;
function convertToNum(string) {
    var code = "";
    Array.from(string).map((c, key) => {
        try {
            _.map(STRS, function (STR, index) {
                var idx = STR.indexOf(c);
                if (idx > -1) {
                    code += index + "" + idx;
                    //console.log(c + " : " + index + "" + idx);
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
    var str = string.length > MAX_DIGIT ? string.substr(0, MAX_DIGIT - 1) : string;
    return str;
}
//Dead Kjhkhjk
function genOwnerCode(itemCode, item) {
    var firstName = getMAXString(item.owner.firstName);
    var lastName = getMAXString(item.owner.lastName);
    var state = getMAXString(item.owner.state);
    var country = getMAXString(item.owner.country);
    var zipCode = getMAXString(item.owner.zipCode);

    var allStr = " " + firstName + " " + lastName + " " + state + " " + zipCode + " " + country
        + "[" + item.owner.position.coords.latitude + "," + item.owner.position.coords.longitude + " " + item.owner.position.coords.altitude + "] "
        + item.owner.weather.main.temp + "C";
    var code = itemCode + convertToNum(allStr);
    console.log("genOwnerCode " + code);
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

var insertItem = function (item) {
    item.id = uuid.v4();
    var itemCode = genItemCode(item);
    var ownerCode = genOwnerCode(itemCode, item)
    item.code = itemCode;
    item.shortCode = LZString.compress(itemCode);
    item.owner.code = ownerCode;
    item.owner.shortCode = LZString.compress(ownerCode);

    console.log("owner code " + ownerCode + " for " + convertToString(ownerCode));
    console.log("ownershortCode " + item.owner.shortCode + " itemshortcode " + item.shortCode);
    return sellrepo.insertItem(item);
};
var getItemById = function (id) {
    return sellrepo.getItemById(id);
};
var getItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    return sellrepo.getItemsByOwnerId(ownerId, pageNum, pageSize);
};
var getItemBySellSectionId = function (sellSectionId) {
    return sellrepo.getItemBySellSectionId(sellSectionId);
};
var getCategories = function () {
    return sellrepo.getCategories();
};
var updateOMIDCODE = function (info) {
    var allStr = "";
    OMID_CODE = convertToNum(allStr);
    return OMID_CODE;
}
module.exports =
    {
        insertItem: insertItem,
        getItemById: getItemById,
        getItemsByOwnerId: getItemsByOwnerId,
        getItemBySellSectionId: getItemBySellSectionId,
        getCategories: getCategories,
        updateOMIDCODE: updateOMIDCODE
    }