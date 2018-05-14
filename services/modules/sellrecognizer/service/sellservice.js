var q = require('q');
var sellrepo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
var comm = require("../../common/common");
var LZString = require('lz-string');
var MAX_DIGIT = 8;
function convertStringToNumWithDescription(str) {
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
}
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
        + "[" + owner.position.coord.latitude + "," + owner.position.coord.longitude + " " + owner.position.coord.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var code = convertToNum(allStr);
    return code;

}

function genItemCode(item) {
    var category = getMAXString(item.category.value);
    var name = getMAXString(item.name);

    var allStr = "[ID " + item.id + "]" + category + " " + name;
    var code = convertToNum(allStr);
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
var genCode = function (str) {
    var deferred = q.defer();

    var data = convertStringToNumWithDescription(str);
    deferred.resolve(data);
    return deferred.promise;
};
var updateAllOwnerCode = function () {
    return sellrepo.updateAllOwnerCode(global.OMID_CODE);
};


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
var getItemByQRCode = function (qrCode, coord) {
    var deferred = q.defer();
    var qr = qrCode; //lzjs.decompress(qrCode);
    sellrepo.getItemByQRCode(qr, coord).then(function (item) {
        // item.location = item.location || { coord: coord };
        // var distanceInMeter = comm.getDistance(coord, item.location.coord);
        // if (distanceInMeter < 50){
        //     item.location.coord = coord;            
        //     item.location.qrCode = coord;
        //     sellrepo.updateItem(item);
        // }
        if (item.sellCode.length > 0){
            deferred.resolve(item);
        }
        else {
            deferred.reject("Item is not published");
        }
    });
    return deferred.promise;
};
var insertItem = function (item) {
    item.id = uuid.v4();
    var itemCode = genItemCode(item);
    var ownerCode = genInfoCode("[Product]", item.owner)
    var sellWwnerCode = genInfoCode("[Sell]", item.owner)



    item.code = itemCode + ownerCode;
    item.owner.code = ownerCode;
    item.section = { active: true, code: "", history: [] };
    item.section.history.push(item.owner);

    item.sellCode = item.code + sellWwnerCode;
    item.section.code = item.code + sellWwnerCode + global.OMID_CODE;

    item.buyerCode = "";
    item.buyer = undefined;
    item.location = {
        coord: item.owner.position.coord
    };
    return sellrepo.insertItem(item);
};
var payment = function (itemId, buyerInfo) {
    var buyerCode = genInfoCode("[Buy]", buyerInfo);
    buyerInfo.code = buyerCode;
    var deferred = q.defer();
    sellrepo.getItemById(itemId).then(function (item) {
        item.buyer = buyerInfo;
        item.buyerCode = item.sellCode + global.OMID_CODE + buyerCode;
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
var getProductsByBluetoothCodes = function (devices, coord) {
    var deferred = q.defer();
    var names = _.map(devices, function(e,i){ return e.id});
    sellrepo.getProductsByBluetoothCodes(names, coord).then(function(items){       

        var its = _.filter(items, function(e,i){
            var device = _.filter(devices, function(de,di){ return de.id == e.bluetoothCode })[0]; 


            coord.distance = device.distance;
            coord.id = device.id;
            coord.ownerId = device.ownerId;

            var ownerCoord = e.owner.position.coord;
            ownerCoord.distance = device.distance;

            e.location = e.location || {coord: ownerCoord};
            e.location.coord = e.location.coord || ownerCoord;
            e.location.coord.distance = device.distance;

            // var co = location.coord || e.owner.position.coord; // 1
            // co.distance = device.distance

            // var newCoord = comm.getTransitivityCoordinate(coord, co, device.distance); // 2
            // newCoord.altitude = coord.altitude;
            // newCoord.distance = device.distance;

            e.location.bluetooth = e.location.bluetooth || [] // 3
            if (e.location.bluetooth.length < 3){                
                e.location.bluetooth.push(coord);
            }
            else {

                var index = -1;
                _.forEach(e.location.bluetooth, function(be,bi){
                    if (be.ownerId == device.ownerId && be.id == device.id){
                        index = bi;                        
                    }
                });
                if (index > -1){
                    e.location.bluetooth[index] = coord;
                }                
                

                var exactCoord = {};

                var intersectorPoints = []
                _.forEach(e.location.bluetooth, function(beA,biA){
                    _.forEach(e.location.bluetooth, function(beB,biB){
                        var ps = comm.getIntersections(beA.latitude, beA.longitude, beA.distance, beB.latitude, beB.longitude, beB.distance);
                        if (ps.length > 0){
                            Array.prototype.push.apply(intersectorPoints, ps);
                           
                        }                     
                    });

                });
                if(intersectorPoints.length > 1){
                    var center = comm.getCenter(intersectorPoints);
                    exactCoord = center;
                    exactCoord.altitude = coord.altitude;
                }
                else if(intersectorPoints.length == 1){
                    exactCoord = {
                        latitude: intersectorPoints[0].lat(),
                        longitude: intersectorPoints[0].lng(),
                        altitude: coord.altitude
                    }
                }
                else {
                    exactCoord = coord;
                }

                e.location.coord = exactCoord;       
            }
            
            
            
            sellrepo.updateItem(e);

            return e.sellCode.length > 0;
        });
        deferred.resolve(its);
    });
    return deferred.promise;
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
        genCode: genCode,
    }