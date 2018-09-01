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
function convertToNum(string) {
    var code = "";
    Array.from(string).map((c, key) => {
        try {
            _.map(STRS, function (STR, index) {
                try{
                    var idx = STR.indexOf(c);
                    if (idx > -1) {
                        code += index + "" + idx;
                    }
                }
                catch(es){

                }
            });
        } catch (e) {
            console.log("convertToNum Error " + e);
        }
    });
    return code;
}
function genUserInfoCode(action, userInfo) {

    var allStr = "[" + action + " " + userInfo.time + "]" 
                + "[" + userInfo.firstName + " " + userInfo.lastName + "][" + userInfo.state + "-" + userInfo.zipCode + "-" + userInfo.country + "]"
                + "[" + userInfo.position.coord.latitude + "," + userInfo.position.coord.longitude + " " + userInfo.position.coord.altitude + "]"
                + "[" + userInfo.weather.main.temp + "C]";
    var code = convertToNum(allStr);
    return code;

}
function createUserInfoCode(action, userInfo){
    var str = genUserInfoCode(action, userInfo);
    return str;
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
var createMaterial = function (mat) {
    var code = createUserInfoCode("OWNER " + mat.name, mat.userInfo);
    var material = {
        id :            uuid.v4(),
        ownerId :       mat.ownerId,
        name :          mat.name,
        description :   mat.description,
        image :         mat.image,
        code :          code,
        bluetooth :     mat.bluetooth,
        createdAt :     comm.dateLong(),
        updatedAt :     comm.dateLong(),
        tasks:          []
    };    
    return repo.createMaterial(material);
}
var createTask = function (task) {
    var code = createUserInfoCode("TASK " + task.name,task.userInfo);
    var newTask = {
        id :            uuid.v4(),        
        name :          task.name,
        description :   task.description,
        image :         task.image,
        code :          code,        
        workers:        []
    };    
    return repo.createTask(task.materialId, newTask).then(function(done){
        return task;
    });
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
var saveActivity = function(materialId, taskId, workerId, title, description, imageNames, fileNames, userInfo){
    var code = createUserInfoCode("ACTIVITY " + title, userInfo);
    let activity = {
        id : uuid.v4(),
        title: title,
        description: description,
        images: imageNames,
        files: fileNames,
        time: comm.dateLong(),
        cood: userInfo.position.coord,
        code: code
    }
    return repo.saveActivity(materialId, taskId, workerId, activity).then(function(done){
        return done;
    });
}
var getMaterialByQRCode = function(qrcode){
    return repo.getMaterialByQRCode(qrcode);
}
var getMaterialsByBluetooths = function(bluetooths, coord, myId) {
    var bluetoothIds = bluetooths.map(p => p.id);
    return repo.getMaterialsByBluetoothIds(bluetoothIds, myId);
}
module.exports =
{
    login: login,
    getMaterialsByOwnerId: getMaterialsByOwnerId,
    getMaterialById: getMaterialById,
    assignWorkerToTask: assignWorkerToTask,
    saveActivity: saveActivity,
    getUserById: getUserById,
    getMaterialByQRCode:getMaterialByQRCode,
    createMaterial:createMaterial,
    createTask:createTask,
    getMaterialsByBluetooths:getMaterialsByBluetooths,
}