var q = require('q');
var repo = require("../repo/mongodb");
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');
var comm = require("../../common/common");
var map = require("../../common/map");
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
function isTasKDone(task){
    if (task.workers.length == 0){
        return false;
    }
    var doneWorkers = _.filter(task.workers, function (worker) {
        return worker.status == 2; // -1 means not present
    });
    return doneWorkers.length == task.workers.length;
}

function calculatePositionAndUpdate(item){   
    var coord = {
        latitude : 0.0,
        longitude : 0.0,
        altitude : 0.0,
        distance : 0.0
    };
    // First sort ASC 
    var ascending = _.sortBy(item.beaconLocations, 'time'); 
    // Then get DESC 
    var beaconLocations = ascending.reverse().slice(0, 2);    
    if (beaconLocations.length > 0){        
        var current = comm.dateLong();
        beaconLocations = beaconLocations.filter(p => current - p.time < 10000 );
    }
    if (beaconLocations.length == 0){  
        global.itemIdsToUpdateBeaconLocation = global.itemIdsToUpdateBeaconLocation.filter(p => p !==  item.id);
    }
    else {        
        console.log("calculatePositionAndUpdate " + item.name + " (global.itemIdsToUpdateBeaconLocation : " + global.itemIdsToUpdateBeaconLocation.length + " )");
        if (beaconLocations.length == 1){
            // if beaconLocations has 1 item then use it as new location
            var  beaconLocation = beaconLocations[0];
            coord.latitude = beaconLocation.position.latitude;
            coord.longitude = beaconLocation.position.longitude;
            coord.altitude = beaconLocation.position.altitude;
            coord.distance = beaconLocation.distance;
        }
        else if (beaconLocations.length >= 2){
            var circles = [];
            for(var i = 0 ; i < beaconLocations.length; i++){
                var beaconLocation = beaconLocations[i];
                var circle = {
                    latitude : beaconLocation.position.latitude,
                    longitude : beaconLocation.position.longitude,
                    radius: beaconLocation.distance
                };
                circles.push(circle);
            }

            coord = map.getCenterOfCircles(circles);
            coord.altitude = 0.0;
            coord.distance = 0.0;
            
        }
        repo.updateBeaconCurrentPosition(item.id, coord);
    }
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
        imageUrl :      mat.imageUrl,
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
        imageUrl :      task.imageUrl,
        code :          code,        
        workers:        [],
        status:         0
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
var saveActivity = function(itemId, materialId, taskId, workerId, title, description, imageNames, fileNames, userInfo){
    var code = createUserInfoCode("ACTIVITY " + title, userInfo);
        let activity = {
            id : uuid.v4(),
            title: title,
            description: description,
            images: imageNames,
            files: fileNames,
            time: comm.dateLong(),
            coord: userInfo.position.coord,
            code: code
        };
    
    if (itemId === ""){         
        return repo.saveActivity(materialId, taskId, workerId, activity).then(function(done){
            return done;
        });
    }
    else {        
        activity.worker = userInfo;

        return repo.addMaintain(itemId, activity);
    }
}
var getMaterialByQRCode = function(qrcode){
    return repo.getMaterialByQRCode(qrcode);
}
var getObjectByQRCode = function(qrcode){

    // return Promise.Promise.all([
    //     repo.getMaterialByQRCode(qrcode),
    //     repo.getItemByQRCode(),
    // ])
    // .then(([material, item]) => {
    //     if (material){
    //         return {
    //             type: 1,
    //             item: material
    //         };
    //     }
    //     if (item){
    //         return {
    //             type: 2,
    //             item: item
    //         };
    //     }
    // });
    return repo.getMaterialByQRCode(qrcode).then(function(material){
        if (material){
            console.log("getObjectByQRCode found 1 material");
            return {
                type: 1,
                item: material
            };
        }
        else {
            return repo.getItemByQRCode(qrcode).then(function(item){
                if (item){
                    console.log("getObjectByQRCode found 1 item");
                    return {
                        type: 2,
                        item: item
                    };
                }
                else {
                    console.log("getObjectByQRCode found no with qrcode " + qrcode);
                }
            });
        }
    });
}

var getMaterialsByBluetooths = function(bluetooths, coord, myId) {
    var bluetoothIds = bluetooths.map(p => p.id);
    return repo.getMaterialsByBluetoothIds(bluetoothIds, myId);
}
var getTaskById = function(materialId, taskId) {    
    return repo.getTaskById(materialId, taskId);
}
var finishTask = function(materialId, taskId, taskName, userInfo) {    
    return repo.finishTask(materialId, taskId).then(function(done) {
        var code = createUserInfoCode("DONETASK " + taskName, userInfo);
        var updatedAt = comm.dateLong();
        return repo.updateMaterialCode(materialId, code, updatedAt).then(function(edited) {
            return done;
        });
    });
}
var getItemsByBeaconUUIDs = function(beaconUUIDs) {    
    return repo.getItemsByBeaconUUIDs(beaconUUIDs);
}
var getItemById = function(itemId) {    
    return repo.getItemById(itemId);
}
var uploadBeaconLocation = function(data) {        
    if (global.itemIdsToUpdateBeaconLocation.indexOf(data.itemId) !== -1){
        global.itemIdsToUpdateBeaconLocation =  global.itemIdsToUpdateBeaconLocation.filter(function(e) { return e !== data.itemId });
    }   
    global.itemIdsToUpdateBeaconLocation.splice(0, 0, data.itemId);

    var time = comm.dateLong();
    repo.uploadBeaconLocation(data.itemId, data.proximityId, data.position, data.distance, data.userId, time);
    return repo.getItemById(data.itemId);
}
var updateAllBeaconLcationEachMinute = function(count){    
    var time = 3;
    // console.log("updateAllBeaconLcationEachMinute " + count);
    if (count > 58){
        return
    }
    setTimeout(function() {        
        var top10Items = global.itemIdsToUpdateBeaconLocation.slice(0, 10);
        repo.getItemsByIds(top10Items).then(function(items){            
            for(var i = 0; i< items.length; i++){
                var item = items[i];
                calculatePositionAndUpdate(item);
            }
        });        
        updateAllBeaconLcationEachMinute(count + time);
    }, 1000 * time);
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
    getObjectByQRCode:getObjectByQRCode,
    createMaterial:createMaterial,
    createTask:createTask,
    getMaterialsByBluetooths:getMaterialsByBluetooths,
    getTaskById: getTaskById,
    finishTask: finishTask,
    getItemsByBeaconUUIDs:getItemsByBeaconUUIDs,
    uploadBeaconLocation:uploadBeaconLocation,
    updateAllBeaconLcationEachMinute:updateAllBeaconLcationEachMinute,
    getItemById:getItemById,
}

/**
 * .then(function(material){

        var tasks = material.tasks;
        if (tasks.length > 0 ){
            var lastTaskFinishded = -1;
            for(var i = 0; i < tasks.length; i++){
                var task = tasks[i];
                if (isTasKDone(task)){
                    lastTaskFinishded = i;
                }
            }
            if (lastTaskFinishded > -1){
                tasks.splice(lastTaskFinishded, 0, {
                    id: material.code
                });
            }
        }
        return material;
    })
 * 
 * 
 * 
 */