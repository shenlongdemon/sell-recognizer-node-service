var q = require('q');
var ubuilderrepo = require('../../sellrecognizer/repo/mongodb');
var common = require('../../common/common');

var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');

var LZString = require('lz-string');
var MAX_DIGIT = 8;

var getProjectCode = function (project) {
    var owner = project.owner;
    var allStr = project.type.value + " " + project.name + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var data = common.convertStringToNumWithDescription(allStr);
    return data;
};
var getUserCode = function (action, owner) {
    var allStr = action + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var data = common.convertStringToNumWithDescription(allStr);
    return data;
};
var getTaskCode = function (project, task) {
    var owner = project.owner;
    var ownerTask = task.owner;
    var allStr = project.name + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var data = common.convertStringToNumWithDescription(allStr);
    return data;
};
var getProjectsByOwnerId = function (ownerId, pageNum, pageSize) {
    return ubuilderrepo.getProjectsByOwnerId(ownerId, pageNum, pageSize);
};
var insertProject = function (proj) {
    proj.id = uuid.v4();
    proj.module = {
        tasks: []
    };
    var projectCode = getProjectCode(proj);
    proj.code = projectCode.code;
    var ownerCode = getUserCode("[OWNER]", proj.owner);
    proj.owner.code = ownerCode.code;
    return ubuilderrepo.insertProject(proj);
};
var getProjectTypes = function () {

    return ubuilderrepo.getProjectTypes();
};
var getUserById = function (userId) {
    return ubuilderrepo.getUserById(userId);
};
var addTask = function (projectId, task) {   
    var deferred = q.defer();
    ubuilderrepo.getProjectById(projectId).then(function (project) {

        project.module = project.module || {tasks : []}
        project.module.tasks = project.module.tasks || []
        task.id = uuid.v4()
        


        item.buyer = buyerInfo;
        item.buyerCode = item.sellCode + global.OMID_CODE + buyerCode;
        sellrepo.updateItem(item).then((res) => {
            deferred.resolve(res);
        });
    });
    return deferred.promise;
};
module.exports =
    {
        getProjectsByOwnerId: getProjectsByOwnerId,
        insertProject: insertProject,
        getProjectTypes: getProjectTypes,
        getUserById: getUserById,
        addTask: addTask,
    }