
/*
 * GET users listing.
 */

var q = require('q');
var test = require("./modules/test/test");
var sellrecognizer = require("./modules/sellrecognizer/sellrecognizer");

var _ = require('underscore');
module.exports =
{
	doaction: function(service, action, ...obj){
		console.log("service call doaction " + service + "/" + action);
		var deferred = q.defer();
		try{
			var ret = eval(service +'["' + action + '"](...obj)');		
			deferred.resolve(ret);	
			
		}
		catch(ex){
			deferred.reject(ex);
		}
    	return deferred.promise;
	}
}