
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
module.exports =
{
    getProjectsByOwnerId: getProjectsByOwnerId,
    insertProject: insertProject,
    getProjectTypes:getProjectTypes,
}