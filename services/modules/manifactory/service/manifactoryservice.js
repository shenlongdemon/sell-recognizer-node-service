var q = require('q');
var repo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
var comm = require("../../common/common");
var LZString = require('lz-string');
var MAX_DIGIT = 8;

function createWorkerInTask(){
    return {
        id : uuid.v4(),
        owner : {},
        activities : [],
        time : comm.dateLong()
    };
}

var login = function (phone, password) {
    return repo.login(phone, password);
}
var getMaterialsByOwnerId = function (id, pageSize, pageNum) {
    return repo.getMaterialsByOwnerId(id, pageSize, pageNum);
}
var getMaterialById = function (id) {
    return repo.getMaterialById(id);
}
var getUserById = function (id) {
    return repo.getUserById(id);
}


var assignWorkerToTask = function (materialId, taskId, workerId){
    return repo.getUserById(workerId).then(function(user){
        var worker = createWorkerInTask();
        worker.owner = user;
        return repo.assignWorkerToTask(materialId, taskId, worker).then(function(done){
            return worker;
        });
    });
}
var saveActivity = function(materialId, taskId, workerId, title, description, imageNames){
    let activity = {
        id : uuid.v4(),
        title: title,
        description: description,
        images: imageNames,
        time: comm.dateLong()
    }
    return repo.saveActivity(materialId, taskId, workerId, activity).then(function(done){
        return done;
    });
}
module.exports =
{
    login: login,
    getMaterialsByOwnerId: getMaterialsByOwnerId,
    getMaterialById: getMaterialById,
    assignWorkerToTask: assignWorkerToTask,
    saveActivity: saveActivity,
    getUserById: getUserById,
}