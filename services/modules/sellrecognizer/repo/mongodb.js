var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/SellRecognizer';
var q = require('q');
import config from './config.json';

var insertItem = function(item){    	
	MongoClient.connect(url, function (err, db) {
        if (err) {
          console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
          //HURRAY!! We are connected. :)
          console.log('Connection established to', url);      
          // Get the documents collection
          var collection = db.collection('Items');                      
          // Insert some users
          collection.insert([item], function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
            }
            //Close connection
            db.close();
          });
        }
      });

};
module.exports =
{	
	insertItem: insertItem
}