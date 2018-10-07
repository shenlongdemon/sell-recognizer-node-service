
/*
 * GET users listing.
 */

var q = require('q');
var _ = require('underscore');
var service = require("./service/manifactoryservice");

var getMaterialsByOwnerId = function (id, pageSize, pageNum) {
    var deferred = q.defer();
    service.getMaterialsByOwnerId(id, parseInt(pageSize), parseInt(pageNum)).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getMaterialById = function (id) {
    var deferred = q.defer();
    service.getMaterialById(id).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var createMaterial = function(mat){
    var deferred = q.defer();
    service.createMaterial(mat).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var createTask = function(task){
    var deferred = q.defer();
    service.createTask(task).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var getUserById = function (id) {
    var deferred = q.defer();
    service.getUserById(id).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getMaterialByQRCode = function (req) {
    var deferred = q.defer();
    service.getMaterialByQRCode(req.qrcode).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getObjectByQRCode = function (req) {
    var deferred = q.defer();
    service.getObjectByQRCode(req.qrcode).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var assignWorkerToTask = function (req) {
    var deferred = q.defer();
    service.assignWorkerToTask(req.materialId, req.taskId, req.workerId).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var saveActivity = function (data) {
    var deferred = q.defer();
    service.saveActivity(data.itemId, data.materialId, data.taskId, data.workerId, data.title, data.description, data.imageNames, data.fileNames, data.userInfo).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var login = function (data) {
    var deferred = q.defer();
    service.login(data.phone, data.password).then(function (item) {
        var res = {
            Data: item,
            Message: item != null ? "" : "Invalid phone or password",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    }).catch(function (ex) {
        var res = {
            Data: null,
            Message: ex,
            Status: -1
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getMaterialsByBluetooths = function (req) {
    var deferred = q.defer();
    service.getMaterialsByBluetooths(req.bluetooths, req.coord, req.myId).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getBeaconsByBluetoothIds = function (req) {
    var deferred = q.defer();
    service.getBeaconsByBluetoothIds(req.bluetoothIds).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var getTaskById = function (materialId, taskId) {
    var deferred = q.defer();
    service.getTaskById(materialId, taskId).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var finishTask = function (data) {
    var deferred = q.defer();
    service.finishTask(data.materialId, data.taskId, data.taskName, data.userInfo).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}

var getItemsByBeaconUUIDs  = function (data) {
    var deferred = q.defer();
    service.getItemsByBeaconUUIDs(data.beaconUUIDs).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var uploadBeaconLocation  = function (data) {
    var deferred = q.defer();
    service.uploadBeaconLocation(data).then(function (data) {
        var res = {
            Data: data,
            Message: data != null ? "" : "Invalid phone or password",
            Status: data != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getItemById = function (id) {
    console.log("begin manufactory controller getItemById " + id);
    var deferred = q.defer();

    service.getItemById(id)
        .then(function (res) {
            console.log("manufactory controller getItemById " + res);
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
module.exports =
    {
        login: login,
        getMaterialsByOwnerId: getMaterialsByOwnerId,
        getMaterialById: getMaterialById,
        assignWorkerToTask:assignWorkerToTask,
        saveActivity: saveActivity,
        getUserById: getUserById,
        getMaterialByQRCode:getMaterialByQRCode,
        createMaterial: createMaterial,
        createTask: createTask,
        getMaterialsByBluetooths:getMaterialsByBluetooths,
        getTaskById:getTaskById,
        finishTask:finishTask,
        getItemsByBeaconUUIDs: getItemsByBeaconUUIDs,
        uploadBeaconLocation: uploadBeaconLocation,
        getObjectByQRCode:getObjectByQRCode,
        getItemById:getItemById,
        getBeaconsByBluetoothIds:getBeaconsByBluetoothIds,
    }