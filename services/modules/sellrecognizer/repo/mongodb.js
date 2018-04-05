var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var dbConfig = require("./mongo.config");
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/SellRecognizer';
var q = require('q');

function openConnect(){
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
  openConnect().then(function(database){
    var collection = database.db(dbConfig.collections.namme).collection(dbConfig.collections.items);
    // Insert some users
    collection.insert([item], function (err, result) {
      if (err) {
        console.log("repo insertItem error when insert " + err);
        deferred.reject(err);
      } else {
        console.log('repo insertItem are: ', result);
        deferred.resolve(result);
      }
      //Close connection
      database.close(true);

    });
  });
  return deferred.promise;
};
var getItemsBy = function(query, pageNum, pageSize){
  console.log('begin repo getItemsBy ', query);
  var deferred = q.defer();
  var num = parseInt(pageNum);
  num = num < 1 ? num = 1 : num = num;
  var size = parseInt(pageSize);
  size = size < 1 ? size = 10 : size = size;
  openConnect().then(function(database){
    var query = query;
    // Get the documents collection      
    var collection = database.db(dbConfig.collections.namme).collection(dbConfig.collections.items);
    // Insert some users
    collection.find(query)
      .sort( { _id: -1 } ).skip((num - 1) * size).limit(size).toArray(function(err, result) {
      if (err) {
        console.log("repo getItems error when find " + err);
        deferred.reject(err);
      } else {
        console.log('repo getItems are: ', result);
        if (size == 1 && result.length > 0){
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

var getItemBySellSectionId = function(sellSectionId){ 
    var query = { "sellSections.id": sellSectionId };
    return getItemsBy(query, 1, 1);
};
module.exports =
  {
    insertItem: insertItem,
    getItemById: getItemById,
    getItemsByOwnerId: getItemsByOwnerId,
    getItemBySellSectionId: getItemBySellSectionId
  }