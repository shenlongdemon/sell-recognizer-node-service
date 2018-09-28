var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var dbConfig = require("./mongo.config");
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/SellRecognizer';
var q = require('q');
var _ = require('underscore');

function openConnect() {
    var deferred = q.defer();
    mongodb.MongoClient.connect(dbConfig.url, function (err, database) {
        if (err) {
            console.log('repo openConnect Unable to connect to the mongoDB server. Error:', err);
            deferred.reject(err);
        } else {
            //HURRAY!! We are connected. :)
            // console.log('repo openConnect Connection established to', url);
            deferred.resolve(database);
        }
    });
    return deferred.promise;
}
function findMany(collectionName, query, pageSize, pageNum){
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10000 : size = size;
    openConnect().then(function (database) {       
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        collection.find(query).skip((num - 1) * size).limit(size).toArray(function (err, result) {
            if (err) {
                console.log("repo getItems error when find " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
            closeDataBase(database);
        });

    });
    return deferred.promise;
}

function findOne(collectionName, query){
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        collection.findOne(query).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            closeDataBase(database);
        });
    });
    return deferred.promise;
}
function insert(collectionName, document){
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        collection.insert(document).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(document);
            }
            closeDataBase(database);
        });
    });
    return deferred.promise;
}
function update(collectionName, query, set){
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        collection.update(query, set).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            closeDataBase(database);
        });
    });
    return deferred.promise;
}
function updateWithOption(collectionName, query, set, option){
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        collection.update(query, set, option).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            closeDataBase(database);
        });
    });
    return deferred.promise;
}
function closeDataBase(database) {
    setTimeout(function () {
        if (database != null) {
            database.close(true);
        }
    }, 5000);
}
var login = function (phone, password) {    
    var q = { $and: [{ phone: phone }, { password: password }] };
    return findOne(dbConfig.collections.users, q);
};
var getMaterialsByOwnerId = function (id, pageSize, pageNum) {    
    var q = {ownerId: id};
    return findMany(dbConfig.collections.materials, q, pageSize, pageNum);
};
var getMaterialById = function (id) {    
    var q = {id:id };
    return findOne(dbConfig.collections.materials, q);
};
var getUserById = function (id) {    
    var q = {id:id };
    return findOne(dbConfig.collections.users, q);
};
var createMaterial = function(material){
    return insert(dbConfig.collections.materials, material);
}
var createTask = function(materialId, task){
    var q = {
        id: materialId
    };
    var set = { 
        "$push": {
            "tasks":  task
        }
    };
    return update(dbConfig.collections.materials, q, set);
}

var assignWorkerToTask = function (materialId, taskId, worker){
    var q = {
        id: materialId,
        "tasks.id":taskId
    };
    var set = { 
        "$push": {
            "tasks.$.workers":  worker
        }
    };
    return update(dbConfig.collections.materials, q, set);
}
var getMaterialByQRCode = function(qrcode){
    var query = {        
        $or: [
            { id: qrcode }, 
            { code: qrcode },            
            { "tasks.code": qrcode },
            { "tasks.id": qrcode }
        ]        
    };
    return findOne(dbConfig.collections.materials, query);
}
var getItemByQRCode = function(qrcode){
    var query = {        
        $or: [
            { id: qrcode }, 
            { code: qrcode },            
            { "material.id": qrcode },
            { "material.code": qrcode },
            { "material.tasks.code": qrcode }            
        ]        
    };
    return findOne(dbConfig.collections.items, query);
}
var saveActivity = function(materialId, taskId, workerId, activity){

    let collection = dbConfig.collections.materials;
    var mq = {
        id: materialId
    };
    return findOne(collection, mq).then(function(mat){
        var task = _.find(mat.tasks,function(task){return task.id == taskId});
        var taskIndex = _.findIndex(mat.tasks,function(t){ return t.id == taskId});
        var workerIndex = _.findIndex(task.workers,function(w){ return w.owner.id == workerId});

        var q = {
            id: materialId,
            "tasks.id":taskId,
            "tasks.workers.owner.id" : workerId,
        };

        // update status of worker = 1 --> starting
        let pathStatus = "tasks." + taskIndex + ".workers." + workerIndex + ".status";
        var sStatus = '{ "$set": { "' + pathStatus + '" :  ' + 1 + '}}';
        var setStatus = JSON.parse(sStatus);
        update(collection, q, setStatus);

        let path = "tasks." + taskIndex + ".workers." + workerIndex + ".activities";
        var s = '{ "$push": { "' + path + '" :  ' + JSON.stringify(activity) + '}}';
        var set = JSON.parse(s);        

        return update(collection, q, set);
    });
    
}
var getMaterialsByBluetoothIds = function(bluetoothIds, myId){
    var q = { 
        $and : [
            {   bluetooth: { "$in": bluetoothIds } },
            {
                $or : [
                    {   ownerId : myId  },
                    {
                        "tasks.workers.owner.id" : myId,
                    }
                ]
            }
        ]
        
    };
    return findMany(dbConfig.collections.materials, q, 1000, 1);
}
var getTaskById = function(materialId, taskId){
    var query = {        
        id:  materialId,
        "tasks.id" : taskId,
        tasks: {
            $elemMatch : {
                id : taskId
            }
        }
    };
    return findOne(dbConfig.collections.materials, query).then(function(material){
        var task = _.find(material.tasks,function(task){return task.id == taskId});       
        return task;
    });;
}
var finishTask = function(materialId, taskId){
    var query = {        
        id:  materialId,
        "tasks.id" : taskId        
    };
    var set = { 
        "$set": {
            "tasks.$.workers.$[].status": 2            
        }
    };
    return update(dbConfig.collections.materials, query, set);
}


var updateMaterialCode = function(materialId, code){
    var q = {
        id: materialId
    };
    var set = { 
        "$set": {
            "code":  code
        }
    };
    return update(dbConfig.collections.materials, q, set);
}

var getItemsByBeaconUUIDs = function(beaconUUIDs){
    var q = {
        $or: [
            { bluetoothCode : { "$in": beaconUUIDs }},
            { "iBeacon.proximityUUID" : { "$in": beaconUUIDs }},
            { "iBeacon.id" : { "$in": beaconUUIDs }},
        ]
    };            
    return findMany(dbConfig.collections.items, q);
}

var uploadBeaconLocation = function(itemId, proximityId, position, distance, userId, time) {
    var q = {        
        $and: [
            {id: itemId },
            {"beaconLocations.id": proximityId},
            {"beaconLocations.userId": userId},
        ]
        
    };
    var set = {$set:{
        "beaconLocations.$.position": position,
        "beaconLocations.$.distance": distance,
        "beaconLocations.$.time": time
    }};
    var option = {
        upsert: true
    };
    return update(dbConfig.collections.items, q, set);
}
var getItemsByIds = function(ids){
    var q = { id: { "$in": ids } };
    return findMany(dbConfig.collections.items, q, 1000, 1);
}
var getItemById = function(itemId){
    var q = {
        id: itemId
    };
    return findOne(dbConfig.collections.items, q);
}
var updateBeaconCurrentPosition = function(itemId, coord){
    var q = {
        id: itemId
    };
    var set = {$set:{
        "iBeacon.coord": coord
    }};
    return update(dbConfig.collections.items, q, set);
}
var addMaintain = function(itemId, activity){
    var q = {
        id: itemId
    };
    var set = {$addToSet:{
        "maintains": activity
    }};
    return update(dbConfig.collections.items, q, set);
}
module.exports =
    {
        login: login,
        getMaterialsByOwnerId:getMaterialsByOwnerId,
        getMaterialById:getMaterialById,
        getUserById: getUserById,
        assignWorkerToTask: assignWorkerToTask,
        saveActivity: saveActivity,
        getMaterialByQRCode:getMaterialByQRCode,
        createMaterial: createMaterial,
        createTask:createTask,
        getMaterialsByBluetoothIds:getMaterialsByBluetoothIds,
        getTaskById: getTaskById,
        finishTask: finishTask,
        updateMaterialCode:updateMaterialCode,
        getItemsByBeaconUUIDs:getItemsByBeaconUUIDs,
        uploadBeaconLocation:uploadBeaconLocation,
        getItemsByIds:getItemsByIds,
        getItemById:getItemById,
        updateBeaconCurrentPosition:updateBeaconCurrentPosition,
        getItemById:getItemById,
        getItemByQRCode:getItemByQRCode,
        addMaintain: addMaintain,
    }