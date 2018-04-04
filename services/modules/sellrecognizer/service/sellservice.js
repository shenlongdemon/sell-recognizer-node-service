var q = require('q');
var sellrepo = require("../repo/mongodb");
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