var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var dbConfig = require("./mongo.config");
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/SellRecognizer';
var q = require('q');

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

        collection.find(query)
            .sort({ _id: -1 }).skip((num - 1) * size).limit(size).toArray(function (err, result) {
                if (err) {
                    console.log("repo getItems error when find " + err);
                    deferred.reject(err);
                } else {
                    console.log('repo getItems are: ', result);
                    if (size == 1 && result.length > 0) {
                        deferred.resolve(result[0]);
                    }
                    else {
                        deferred.resolve(result);
                    }
                }
                //Close connection
                database.close(true);

            });
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
    var query = { ownerId: ownerId };
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
            collection.find({$or:[{"section.active":undefined},{"section.active":false}]})
            .forEach(function(item) { 
                item.section = item.section || {};
                item.section.code = item.owner.code + OMID_CODE
                item.section.active = true;
                collection.save(item);
            });
        } catch (e) {
            console.log("updateAllOwnerCode error " + JSON.stringify(e));
        }

    });
}
module.exports =
    {
        insertItem: insertItem,
        getItemById: getItemById,
        getItemsByOwnerId: getItemsByOwnerId,
        getItemBySellSectionId: getItemBySellSectionId,
        getCategories: getCategories,
        updateAllOwnerCode: updateAllOwnerCode
    }