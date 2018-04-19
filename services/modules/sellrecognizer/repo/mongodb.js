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
function closeDataBase(database) {
    setTimeout(function () {
        database.close(true);
        console.log("close connect db");
    }, 5000);
}
var insertItem = function (item) {
    console.log('begin repo insertItem', JSON.stringify(item));

    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
        // Insert some users
        collection.insert([item], function (err, result) {
            if (err) {
                console.log("repo insertItem error when insert " + err);
                deferred.reject(err);
            } else {
                console.log('repo insertItem are: ', result);
                deferred.resolve(item);
            }
            //Close connection
            database.close(true);

        });
    });
    return deferred.promise;
};
var getItemsBy = function (query, pageNum, pageSize) {
    console.log('begin repo getItemsBy ', query);
    return getBy(dbConfig.collections.items, query, pageNum, pageSize);
};
var getBy = function (collectionName, query, pageNum, pageSize) {
    var deferred = q.defer();
    var num = parseInt(pageNum);
    num = num < 1 ? num = 1 : num = num;
    var size = parseInt(pageSize);
    size = size < 1 ? size = 10000 : size = size;
    console.log("begin repo get " + collectionName + " with " + JSON.stringify(query) + " pageSize " + size + " pageNum " + pageNum);

    openConnect().then(function (database) {
        // Insert some users
        var collection = database.db(dbConfig.dbname).collection(collectionName);
        if (num == 1 && size == 1) {
            collection.findOne(query).then(function (item, err) {
                if (err) {
                    console.log("repo getItems error when find " + err);
                    deferred.reject(err);
                } else {
                    console.log('repo getItem is: ', item);
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
                        console.log('repo getItems are: ', result);
                        deferred.resolve(result);
                    }
                    //Close connection
                    database.close(true);

                });
        }
    });
    return deferred.promise;
};
var getItemById = function (id) {
    console.log('begin repo getItemById ', id);
    var query = { id: id };
    return getItemsBy(query, 1, 1);
};

var getItemsByOwnerId = function (ownerId, pageNum, pageSize) {
    console.log('begin repo getItemsByOwnerId ', ownerId);
    var query = { "owner.id": ownerId };
    return getItemsBy(query, pageNum, pageSize);
};

var getItems = function (pageNum, pageSize) {
    console.log('begin repo getItems');
    var query = {};
    return getItemsBy(query, pageNum, pageSize);
};

var getSelledItems = function (pageNum, pageSize) {
    console.log('begin repo getItems');
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
var updateAllOwnerCode = function (OMID_CODE) {
    openConnect().then(function (database) {
        // Insert some users
        try {
            var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
            collection.find({ $or: [{ section: undefined }, { "section.active": undefined }, { "section.active": true }] })
                .toArray(function (err, result) {
                    if (err) throw err;
                    _.each(result, function (item) {
                        item.section = item.section || {};
                        item.section.code = item.owner.code + OMID_CODE
                        item.section.active = true;
                        collection.save(item);
                        console.log("updateAllOwnerCode update " + JSON.stringify(item));
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
                    console.log("updateAllOwnerCode update " + JSON.stringify(item));

                });
        } catch (e) {
            console.log("updateAllOwnerCode error " + JSON.stringify(e));
        }

    });
};
var getItemByQRCode = function (qrCode) {
    console.log("mongodb getItemByQRCode " + qrCode);
    var query = { code: qrCode };
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
                console.log('repo updateItem are: ', item);
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
var login = function (phone, password) {
    console.log('begin repo login ' + phone + " " + password);
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.users);
        collection.findOne({ $and: [{ phone: phone }, { password: password }] }).then(function (item, err) {
            if (err) {
                console.log("repo updateItem error when findOne " + err);
                deferred.reject(err);
            } else {
                deferred.resolve(item);
            }
            database.close(true);
        });
    });
    return deferred.promise;
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
    }