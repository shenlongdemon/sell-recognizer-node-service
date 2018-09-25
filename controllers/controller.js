
/*
 * GET users listing.
 */
var services = require("./../services/service");
var version = "Add version when return data" + "" ;
var _ = require('underscore');
var upload = require('./config/multer.config.js');


var doupload = function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	var service = req.params.service.toLowerCase();
	var action = req.params.action;

	var queries = Object.getOwnPropertyNames(req.query);
	var values = [];
	_.each(queries, function(query){
		var value = req.query[query];
		values.push(value);
	});
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        return res.end("File uploaded sucessfully!.");
    });
};

var doget = function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	var service = req.params.service.toLowerCase();
	var action = req.params.action;

	var queries = Object.getOwnPropertyNames(req.query);
	var values = [];
	_.each(queries, function(query){
		var value = req.query[query];
		values.push(value);
	});

	// console.log("controller call doget " + service + "/" + action);			
	services["doaction"](service, action, ...values).then(function (data) {					
		res.status(200).send(data);
	}).catch(function (error) {
		var result = {
			Data: error,
			Message: error,
			Status: -1
		};
		res.status(200).send(result);
	});	
};
var dopost = function(req, res){
	res.setHeader('Access-Control-Allow-Origin','*');	
	
	var service = req.params.service.toLowerCase();
	var action = req.params.action;
	var obj = req.body;		

	// console.log("controller call dopost " + service + "/" + action);	
	services["doaction"](service, action, obj).then(function (data) {		    		
		res.status(200).send(data);
	}).catch(function (error) {
		var result = {
			Data: error,
			Message: error,
			Status: -1
		};
		res.status(200).send(result);
	});	
};
module.exports =
{	
    doget: doget,   
    dopost : dopost,
    doupload : doupload
}