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
            console.log('repo openConnect Connection established to', url);
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
            "tasks.workers.owner.id":workerId,
        };
        let path = "tasks." + taskIndex + ".workers." + workerIndex + ".activities";

        var s = '{ "$push": { "' + path + '" :  ' + JSON.stringify(activity) + '}}';
        var set = JSON.parse(s);
        return update(collection, q, set);
    });
    
}
module.exports =
    {
        login: login,
        getMaterialsByOwnerId:getMaterialsByOwnerId,
        getMaterialById:getMaterialById,
        getUserById: getUserById,
        assignWorkerToTask: assignWorkerToTask,
        saveActivity: saveActivity,
    }