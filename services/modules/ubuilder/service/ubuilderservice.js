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
        + owner.weather.main.temp + "C" + " " + owner.time + " " + task.name + " " + task.price + " " + task.time + " " + ownerTask.firstName + " " + ownerTask.lastName;
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

        project.module = project.module || { tasks: [] }
        project.module.tasks = project.module.tasks || []
        task.id = uuid.v4()
        var taskCode = getTaskCode(project, task);
        task.code = taskCode.code;
        project.module.tasks.push(task);
        ubuilderrepo.updateProject(project).then((res) => {
            deferred.resolve(res);
        });
    });
    return deferred.promise;
};
var getProjectById = function (id) {
    return ubuilderrepo.getProjectById(id);
};
var getProjectOrTaskByQRCode = function (code) {
    var deferred = q.defer();
    ubuilderrepo.getProjectOrTaskByQRCode(code).then(function (project) {
        if (project.code == code){
            var p = {
                isProjectNotTask: true,
                project: project
            };
            deferred.resolve(p);
        }
        else {
            var task = undefined
            _.each(project.module.tasks, function(tsk, i){
                if(tsk.code == code){
                    task = tsk;
                    return;
                }
            });
            if (task != undefined){
                var t = {
                    isProjectNotTask: false,
                    task: task,
                    project: project
                };
                deferred.resolve(t);
            }
            else {
                var t = {
                    isProjectNotTask: false
                };
                deferred.resolve(t);
            }
        }
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
        getProjectById: getProjectById,
        getProjectOrTaskByQRCode: getProjectOrTaskByQRCode,
    }