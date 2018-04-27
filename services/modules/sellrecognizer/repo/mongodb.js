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
            //collection.find({ $or: [{ section: undefined }, { "section.active": undefined }, { "section.active": true }] })
            collection.find({ $where: 'this.sellCode.length > 0 && this.buyerCode.length == 0' })

                .toArray(function (err, result) {
                    if (err) throw err;
                    _.each(result, function (item) {
                        item.section = item.section || {};
                        item.section.code = item.sellCode + OMID_CODE;
                        item.section.active = true;
                        collection.save(item);
                        console.log("updateAllOwnerCode update code" + item.section.code);
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
                console.log('repo updateItem are: ', user);
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
    console.log('begin repo publishSell ' + itemId + " " + userInfoCodeAtSellTime);
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.items);
        collection.findOne({ id: itemId }).then(function (item, err) {
            if (err) {
                console.log("repo updateUser error when findOne " + err);
                deferred.reject(err);
            } else {
                console.log('repo publishSell are: ', item);
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
    console.log('begin repo login ' + phone + " " + password);
    var deferred = q.defer();
    openConnect().then(function (database) {
        var collection = database.db(dbConfig.dbname).collection(dbConfig.collections.users);
        collection.findOne({ $and: [{ phone: phone }, { password: password }] }).then(function (item, err) {
            if (err) {
                console.log("repo login error when login " + err);
                deferred.reject(err);
            } else {
                console.log("repo login error when login " + JSON.stringify(item));
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
    console.log('begin repo cancelSell ' + id);
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
                    console.log('repo cancelSell are: ', item);
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
        getProductsByBluetoothCodes:getProductsByBluetoothCodes,
    }