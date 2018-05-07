var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var dbConfig = require("./mongo.config");
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/SellRecognizer';
var q = require('q');
var _ = require('underscore');

function openConnect() {
    var deferred = q.defer();
    MongoClient.connect(dbConfig.url, function (err, database) {
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
var closeDataBase = function(database) {
    setTimeout(function () {
        database.close(true);
    }, 5000);
}
var insertItem = function (item) {

    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
        // Insert some users
        collection.insert([item], function (err, result) {
            if (err) {
                console.log("repo insertItem error when insert " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            //Close connection
            database.close(true);

        });
    });
    return deferred.promise;
};
var getItemsBy = function (query, pageNum, pageSize) {
    return getBy(dbConfig.collections.items, query, pageNum, pageSize);
};
var getBy = function (collectionName, query, pageNum, pageSize) {
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10000 : size = size;

    openConnect().then(function (database) {
        // Insert some users
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        if (num == 1 && size == 1) {
            collection.findOne(query).then(function (item, err) {
                if (err) {
                    console.log("repo getItems error when find " + err);
                    deferred.reject(err);
                } else {
                    deferred.resolve(item);
                }
                //Close connection
                database.close(true);

            });
        }
        else {
            collection.find(query)
                .sort({ _id: -1 }).skip((num - 1) * size).limit(size).toArray(function (err, result) {
                    if (err) {
                        console.log("repo getItems error when find " + err);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result);
                    }
                    //Close connection
                    database.close(true);

                });
        }
    });
    return deferred.promise;
};
var getSingle = function (collectionName, query) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        // Insert some users

        var collection = database.db(dbConfig.dbname).collection(collectionName);

        collection.findOne(query).then(function (item, err) {
            if (err) {
                console.log("repo getItems error when find " + err);
                deferred.reject(err);
            } else {
                deferred.resolve([database, collection, item]);
            }
            //Close connection
            //database.close(true);

        });

    });
    return deferred.promise;
};
var getMulti = function (collectionName, query, pageNum, pageSize) {
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10000 : size = size;
    openConnect().then(function (database) {
        // Insert some users

        var collection = database.db(dbConfig.dbname).collection(collectionName);

        collection.find(query)
            .sort({ _id: -1 }).skip((num - 1) * size).limit(size).toArray(function (err, result) {
                if (err) {
                    console.log("repo getItems error when find " + err);
                    deferred.reject(err);
                } else {
                    deferred.resolve([database,collection ,result]);
                }               

            });

    });
    return deferred.promise;
};
var getItemById = function (id) {
    var query = { id: id };
    return getItemsBy(query, 1, 1);
};

var getItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    var query = { "owner.id": ownerId };
    return getItemsBy(query, pageNum, pageSize);
};

var getItems = function (pageNum, pageSize) {
    var query = {};
    return getItemsBy(query, pageNum, pageSize);
};

var getSelledItems = function (pageNum, pageSize) {
    var query = { $and: [{ sellCode: { $exists: true } }, { sellCode: { $ne: "" } }] };
    return getItemsBy(query, pageNum, pageSize);
};



var getItemBySellSectionId = function (sellSectionId) {
    var query = { "sellSections.id": sellSectionId };
    return getItemsBy(query, 1, 1);
};
var getCategories = function () {
    var query = {};
    return getBy(dbConfig.collections.categories, query, 1, 0);
};
var getProjectTypes = function () {
    var query = {};
    return getBy(dbConfig.collections.projecttypes, query, 1, 0);
};

var updateAllOwnerCode = function (OMID_CODE) {
    openConnect().then(function (database) {
        // Insert some users
        try {
            var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
            //collection.find({ $or: [{ section: undefined }, { "section.active": undefined }, { "section.active": true }] })
            collection.find({ $where: 'this.sellCode.length > 0 && this.buyerCode.length == 0' })

                .toArray(function (err, result) {
                    if (err) throw err;
                    _.each(result, function (item) {
                        item.section = item.section || {};
                        item.section.code = item.sellCode + OMID_CODE;
                        item.section.active = true;
                        collection.save(item);
                    });

                    closeDataBase(database);
                });

        } catch (e) {
            console.log("updateAllOwnerCode error " + JSON.stringify(e));
        }

    });
}
var getByItemId = function (id) {
    openConnect().then(function (database) {
        try {
            var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
            collection.find({ $or: [{ section: undefined }, { "section.active": undefined }, { "section.active": true }] })
                .forEach(function (item) {

                    item.section = item.section || {};
                    item.section.code = item.owner.code + OMID_CODE
                    item.section.active = true;
                    collection.save(item);

                });
        } catch (e) {
            console.log("updateAllOwnerCode error " + JSON.stringify(e));
        }

    });
};
var getItemByQRCode = function (qrCode) {
    console.log("mongodb getItemByQRCode " + qrCode);
    var query = {
        $and: [
            {
                $or: [
                    { code: qrCode },
                    { sellCode: qrCode },
                    { buyerCode: qrCode },
                    { "section.code": qrCode }
                ]
            },
            { $where: 'this.sellCode.length > 0' }
        ]

    };
    return getItemsBy(query, 1, 1);
};

var updateItem = function (itemToUpdate) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        // Insert some users
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);

        collection.findOne({ id: itemToUpdate.id }).then(function (item, err) {
            if (err) {
                console.log("repo updateItem error when findOne " + err);
                deferred.reject(err);
            } else {
                Object.assign(item, itemToUpdate);
                var result = collection.save(item);
                deferred.resolve(item);

            }
            //Close connection
            closeDataBase(database);

        });

    });
    return deferred.promise;

}

var updateUser = function (userId, userDetail) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        // Insert some users
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.users);

        collection.findOne({ id: userId }).then(function (user, err) {
            if (err) {
                console.log("repo updateUser error when findOne " + err);
                deferred.reject(err);
            } else {
                delete userDetail._id;
                Object.assign(user, userDetail);
                var result = collection.save(user);
                deferred.resolve(user);

            }
            //Close connection
            closeDataBase(database);

        });

    });
    return deferred.promise;

}
var publishSell = function (itemId, userInfoCodeAtSellTime) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
        collection.findOne({ id: itemId }).then(function (item, err) {
            if (err) {
                console.log("repo updateUser error when findOne " + err);
                deferred.reject(err);
            } else {
                item.sellCode = item.code + userInfoCodeAtSellTime;
                item.section.code = item.code + userInfoCodeAtSellTime + global.OMID_CODE;
                var result = collection.save(item);
                deferred.resolve(item);

            }
            //Close connection
            closeDataBase(database);

        });
    });
    return deferred.promise;

}

var login = function (phone, password) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.users);
        collection.findOne({ $and: [{ phone: phone }, { password: password }] }).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            database.close(true);
        });
    });
    return deferred.promise;
};
var getItemsByCodes = function (names) {
    var query = { code: { "$in": names } };
    return getBy(dbConfig.collections.items, query, 1, 0);
};
var getProductsByCodes = function (names) {
    var query = {
        $and: [
            { code: { "$in": names } },
            { $where: 'this.sellCode.length > 0' }
        ]

    };
    return getBy(dbConfig.collections.items, query, 1, 0);
};
var getProductsByBluetoothCodes = function (names) {
    var query = {
        $and: [
            { bluetoothCode: { "$in": names } },
            { $where: 'this.sellCode.length > 0' }
        ]

    };
    return getBy(dbConfig.collections.items, query, 1, 0);
};


var getProductsByCategory = function (categoryId, pageNum, pageSize) {
    var query = {
        $and: [
            { $where: 'this.sellCode.length > 0' },
            { $where: 'this.buyerCode.length == 0' },
            { 'category.id': categoryId }
        ]

    };
    return getBy(dbConfig.collections.items, query, pageNum, pageSize);
};
var cancelSell = function (id) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
        collection.findOne({ id: id }).then(function (item, err) {
            if (err) {
                console.log("repo cancelSell error when findOne " + err);
                deferred.reject(err);
            } else {
                if (item.buyerCode.length > 0) {
                    console.log('repo cancelSell error Your item is sold. You cannot cancel.');
                    deferred.reject("Your item is sold. You cannot cancel.");
                }
                else {
                    item.sellCode = "";
                    var result = collection.save(item);
                    deferred.resolve(item);
                }

            }
            //Close connection
            closeDataBase(database);

        });
    });
    return deferred.promise;
};
var getProjectsByOwnerId = function (ownerId, pageNum, pageSize) {
    var query = {
        "owner.id": ownerId
    };
    return getBy(dbConfig.collections.projects, query, pageNum, pageSize);
};
var insertProject = function (proj) {

    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.projects);
        // Insert some users
        collection.insert([proj], function (err, result) {
            if (err) {
                console.log("repo insertProject error when insert " + err);
                deferred.reject(err);
            } else {
                console.log("repo insertProject DONE");
                deferred.resolve(proj);
            }
            //Close connection
            database.close(true);

        });
    });
    return deferred.promise;
};
var getUserById = function (userId) {
    var query = {
        id: userId
    };
    return getBy(dbConfig.collections.users, query, 1, 1);
};

var addTask = function (projectId, task) {
    return ubuilderrepo.addTask(projectId, task);
};
var getProjectById = function (id) {
    var query = {
        id: id
    };
    return getBy(dbConfig.collections.projects, query, 1, 1);
};
var updateProject = function (itemToUpdate) {
    var deferred = q.defer();
    openConnect().then(function (database) {
        // Insert some users
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.projects);

        collection.findOne({ id: itemToUpdate.id }).then(function (item, err) {
            if (err) {
                console.log("repo updateItem error when findOne " + err);
                deferred.reject(err);
            } else {
                Object.assign(item, itemToUpdate);
                var result = collection.save(item);
                deferred.resolve(item);

            }
            //Close connection
            closeDataBase(database);

        });

    });
    return deferred.promise;

}
var getProjectOrTaskByQRCode = function (code) {
    var query = {
        $or: [
            { code: code },
            { "module.tasks.code": code }
        ]
    };
    return getBy(dbConfig.collections.projects, query, 1, 1);

};
var getTasksByOwnerId = function (id, pageNum, pageSize) {
    var query =
        { "module.tasks.owner.id": id };

    return getBy(dbConfig.collections.projects, query, pageNum, pageSize);

};
var getFreeItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    var query = {
        $and: [
            { $where: 'this.sellCode.length == 0' },
            { 'owner.id': ownerId },
            {
                $or: [
                    { use: undefined },
                    { $where: 'this.use.length == 0' }
                ]
            }
        ]
    };

    return getBy(dbConfig.collections.items, query, pageNum, pageSize);

};
var makeUsingItem = function (itemId, usingId) {
    var query = {
        id: itemId
    };
    getSingle(dbConfig.collections.items, query).then(function ([database, collection, item]) {
        item.use = usingId;
        collection.save(item);
        closeDataBase(database);
    });
};
var addItemIntoTask = function (projectId, taskId, item) {
    var deferred = q.defer();
    var projQuyery = {
        id: projectId
    };
    getSingle(dbConfig.collections.projects, projQuyery).then(function ([database, collection, project]) {
        var task = _.find(project.module.tasks, function (t) { return t.id == taskId; });
        task.material = task.material || {}
        task.material.items = task.material.items || []
        task.material.items.push(item);
        collection.save(project);

        makeUsingItem(item.id, task.id);


        deferred.resolve(project);



        closeDataBase(database)

    });
    return deferred.promise;
};
var doneTask = function (projectId, taskId) {

};
var getItemsByIds = function(ids){
    var query = { id: { "$in": ids } };
    return getMulti(dbConfig.collections.items, query,1,1000);
};
module.exports =
    {
        insertItem: insertItem,
        getItemById: getItemById,
        getItemsByOwnerId: getItemsByOwnerId,
        getItemBySellSectionId: getItemBySellSectionId,
        getCategories: getCategories,
        updateAllOwnerCode: updateAllOwnerCode,
        updateItem: updateItem,
        login: login,
        getItems: getItems,
        getSelledItems: getSelledItems,
        getItemByQRCode: getItemByQRCode,
        updateUser: updateUser,
        publishSell: publishSell,
        getItemsByCodes: getItemsByCodes,
        getProductsByCodes: getProductsByCodes,
        getProductsByCategory: getProductsByCategory,
        cancelSell: cancelSell,
        getProductsByBluetoothCodes: getProductsByBluetoothCodes,
        getProjectsByOwnerId: getProjectsByOwnerId,
        insertProject: insertProject,
        getProjectTypes: getProjectTypes,
        getUserById: getUserById,
        addTask: addTask,
        getProjectById: getProjectById,
        updateProject: updateProject,
        getProjectOrTaskByQRCode: getProjectOrTaskByQRCode,
        getTasksByOwnerId: getTasksByOwnerId,
        getFreeItemsByOwnerId: getFreeItemsByOwnerId,
        addItemIntoTask: addItemIntoTask,
        doneTask: doneTask,
        getSingle: getSingle,
        getItemsByIds: getItemsByIds,
        closeDataBase:closeDataBase,
    }