
/*
 * GET users listing.
 */

var q = require('q');
var _ = require('underscore');
var ubuilderService = require("./service/ubuilderservice");

var getProjectsByOwnerId = function (ownerId, pageNum, pageSize) {

    console.log("begin ubuilder controller getProjectsByOwnerId ");
    var deferred = q.defer();
    ubuilderService.getProjectsByOwnerId(ownerId, pageNum, pageSize).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var insertProject = function (data) {

    console.log("begin ubuilder controller insertProject " + data);
    var deferred = q.defer();
    ubuilderService.insertProject(data).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getProjectTypes = function () {

    console.log("begin ubuilder controller getProjectTypes");
    var deferred = q.defer();
    ubuilderService.getProjectTypes().then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getUserById = function (userId) {

    console.log("begin ubuilder controller getUserById");
    var deferred = q.defer();
    ubuilderService.getUserById(userId).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var addTask = function (data) {
    var projectId = data.projectId;
    var task = data.task;
    console.log("begin ubuilder controller addTask");
    var deferred = q.defer();
    ubuilderService.addTask(projectId, task).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getProjectById = function (id) {

    console.log("begin ubuilder controller getProjectById");
    var deferred = q.defer();
    ubuilderService.getProjectById(id).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getProjectOrTaskByQRCode = function (data) {
    var code = data.code;
    console.log("begin ubuilder controller getProjectOrTaskByQRCode");
    var deferred = q.defer();
    ubuilderService.getProjectOrTaskByQRCode(code).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getTasksByOwnerId = function (id, pageNum, pageSize) {
    console.log("begin ubuilder controller getTasksByOwnerId");
    var deferred = q.defer();
    ubuilderService.getTasksByOwnerId(id, pageNum, pageSize).then(function (item) {
        var res = {
            Data: item,
            Message: "",
            Status: item != null ? 1 : 0
        };
        deferred.resolve(res);
    });
    return deferred.promise;
}
var getFreeItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    console.log("begin ubuilder controller getFreeItemsByOwnerId " + ownerId);
    var deferred = q.defer();

    ubuilderService.getFreeItemsByOwnerId(ownerId, pageNum, pageSize)
        .then(function (res) {
            console.log("ubuilder controller getFreeItemsByOwnerId " + res);
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
var addItemIntoTask = function (data) {

    var itemId = data.itemId;
    var projectId = data.projectId;
    var taskId = data.taskId;
    console.log("begin ubuilder controller addItemIntoTask ");
    var deferred = q.defer();

    ubuilderService.addItemIntoTask(projectId, taskId, itemId)
        .then(function (res) {
            console.log("ubuilder controller getFreeItemsByOwnerId " + res);
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
var doneTask = function (projectId, taskId) {
    console.log("begin ubuilder controller doneTask ");
    var deferred = q.defer();

    ubuilderService.doneTask(projectId, taskId)
        .then(function (res) {
            console.log("ubuilder controller doneTask " + res);
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
var getItemsByTask = function (projectId, taskId) {
    console.log("begin ubuilder controller getItemsByTask ");
    var deferred = q.defer();

    ubuilderService.getItemsByTask(projectId, taskId)
        .then(function (res) {
            console.log("ubuilder controller getItemsByTask " + res);
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
        getProjectsByOwnerId: getProjectsByOwnerId,
        insertProject: insertProject,
        getProjectTypes: getProjectTypes,
        getUserById: getUserById,
        addTask: addTask,
        getProjectById: getProjectById,
        getProjectOrTaskByQRCode: getProjectOrTaskByQRCode,
        getTasksByOwnerId: getTasksByOwnerId,
        getFreeItemsByOwnerId: getFreeItemsByOwnerId,
        addItemIntoTask: addItemIntoTask,
        doneTask: doneTask,
        getItemsByTask:getItemsByTask,
    }