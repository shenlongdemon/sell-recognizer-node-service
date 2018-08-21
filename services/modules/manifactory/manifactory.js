
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

var assignWorkerToTask = function (data) {
    var deferred = q.defer();
    service.assignWorkerToTask(data.materialId, data.taskId, data.workerId).then(function (data) {
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
    service.saveActivity(data.materialId, data.taskId, data.workerId, data.title, data.description, data.imageNames).then(function (data) {
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
module.exports =
    {
        login: login,
        getMaterialsByOwnerId: getMaterialsByOwnerId,
        getMaterialById: getMaterialById,
        assignWorkerToTask:assignWorkerToTask,
        saveActivity: saveActivity,
        getUserById: getUserById,
    }