
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
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

    var allStr = " " + action + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var code = convertToNum(allStr);
    return code;

}

function genItemCode(item) {
    var category = getMAXString(item.category.value);
    var name = getMAXString(item.name);

    var allStr = category + " " + name;
    var code = convertToNum(allStr);
    return code;

}
var dateLong = function () {
    var d = new Date();
    var n = d.getTime();
    return n;
};
var convertStringToNumWithDescription = function (str) {
    var code = "";
    var description = ""
    Array.from(str).map((c, key) => {

        _.map(STRS, function (STR, index) {
            var idx = STR.indexOf(c);
            if (idx > -1) {
                code += index + "" + idx;
                description += c;
            }
        });

    });
    var res = {
        code: code,
        str: description
    }
    return res;
};
var restartItem = function(action, item){
    
    var itemCode = genItemCode(item);
    var ownerCode = genInfoCode(action, item.owner)
    item.code = itemCode + ownerCode;
    item.owner.code = ownerCode;
    item.section = item.section || { active: true, code: "", history: [] };
    item.section.history = item.section.history || [];
    item.section.history.push(item.owner);
    item.buyerCode = "";
    item.sellCode = "";
    item.buyer = undefined;
    item.use = "";
};

module.exports =
    {
        dateLong: dateLong,
        convertStringToNumWithDescription: convertStringToNumWithDescription,
        restartItem:restartItem,
    }