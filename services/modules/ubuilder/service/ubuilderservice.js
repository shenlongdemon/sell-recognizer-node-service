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
    var allStr = " [ID " + project.id + "] " + project.name + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time + " [ID " + task.id + "] " + task.name + " " + task.price + " " + task.time + " " + ownerTask.firstName + " " + ownerTask.lastName;
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
        task.material = { items: [] };
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
        if (project.code == code) {
            var p = {
                isProjectNotTask: true,
                project: project
            };
            deferred.resolve(p);
        }
        else {
            var task = undefined
            _.each(project.module.tasks, function (tsk, i) {
                if (tsk.code == code) {
                    task = tsk;
                    return;
                }
            });
            if (task != undefined) {
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
var getTasksByOwnerId = function (id, pageNum, pageSize) {
    return ubuilderrepo.getTasksByOwnerId(id, pageNum, pageSize);
};
var getFreeItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    return ubuilderrepo.getFreeItemsByOwnerId(ownerId, pageNum, pageSize);
};
var addItemIntoTask = function (projectId, taskId, itemId) {
    return ubuilderrepo.addItemIntoTask(projectId, taskId, itemId);
};
var doneTask = function (projectId, taskId) {

    var deferred = q.defer();
    var pQ = { id: projectId };
    ubuilderrepo.getProjectById(projectId).then(function (project) {
        var task = _.find(project.module.tasks, function (t) { return t.id == taskId; });
        task.done = true;
        task.material = task.material || {}
        task.material.items = task.material.items || []
        ubuilderrepo.updateProject(project);
        if (task.material.items.length == 0) {
            deferred.resolve(true);
        }
        else {
            ubuilderrepo.getItemsByIds(task.material.items).then(function ([database, collection, items]) {
                _.each(items, function (e, i) {
                    e.owner = project.owner;
                    common.restartItem("[BUY]", e);
                    collection.save(e);
                });
                ubuilderrepo.closeDataBase(database);
                deferred.resolve(true);
            });
        }
    });

    return deferred.promise;
}
var doneProject = function (projectId) {

    var deferred = q.defer();
    var pQ = { id: projectId };
    ubuilderrepo.getProjectById(projectId).then(function (project) {
        project.done = true;
        ubuilderrepo.updateProject(project);
        deferred.resolve(true);
    });

    return deferred.promise;
}

var getItemsByTask = function (projectId, taskId) {

    var deferred = q.defer();
    var pQ = { id: projectId };
    ubuilderrepo.getProjectById(projectId).then(function (project) {
        var task = _.find(project.module.tasks, function (t) { return t.id == taskId; });
        task.material = task.material || {}
        task.material.items = task.material.items || []

        if (task.material.items.length == 0) {
            deferred.resolve([]);
        }
        else {
            ubuilderrepo.getItemsByIds(task.material.items).then(function ([database, collection, items]) {
                deferred.resolve(items);
                ubuilderrepo.closeDataBase(database);
            });
        }
    });

    return deferred.promise;
}

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
        doneProject: doneProject,
        getItemsByTask: getItemsByTask,
    }