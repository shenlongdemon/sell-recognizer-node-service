
/*
 * GET users listing.
 */

var q = require('q');
var _ = require('underscore');
var sellService = require("./service/sellservice");
var searchImageService = require("./service/serchimageservice");


var searchImage = function(obj){
	console.log("begin sellrecognizer controller searchImage " + obj);
	var deferred = q.defer();	

	searchImageService.searchImage(obj)
		.then(function(res){
			console.log("sellrecognizer controller searchImage " + res);
			var res =  {
				Data : res,
				Message: "",
				Status: 1
			};
			deferred.resolve(res);
		}		
	);	
	return deferred.promise;
};
var insertItem = function(item){
	console.log("begin sellrecognizer controller insertItem " + item);
	var deferred = q.defer();		
	sellService.insertItem(item)
		.then(function(res){
			console.log("sellrecognizer controller insertItem " + res);
			var res =  {
				Data : res,
				Message: "",
				Status: 1
			};
			deferred.resolve(res);
		}		
	);
	
	return deferred.promise;
};
var getItemById = function(id){
	console.log("begin sellrecognizer controller getItemById " + id);
	var deferred = q.defer();		
	
	sellService.getItemById(id)
		.then(function(res){
			console.log("sellrecognizer controller getItemById " + res);
			var res =  {
				Data : res,
				Message: "",
				Status: 1
			};
			deferred.resolve(res);
		}		
	);
	
	return deferred.promise;
};
var getItemsByOwnerId = function(ownerId, pageNum, pageSize){
	console.log("begin sellrecognizer controller getItemsByOwnerId " + ownerId);
	var deferred = q.defer();	
	var num = parseInt(pageNum);
	num = num < 1 ? num = 1 : num = num;
	var size = parseInt(pageSize);
	size = size < 1 ? size = 10 : size = size;
	
	sellService.getItemsByOwnerId(ownerId, num, size)
		.then(function(res){
			console.log("sellrecognizer controller getItemsByOwnerId " + res);
			var res =  {
				Data : res,
				Message: "",
				Status: 1
			};
			deferred.resolve(res);
		}		
	);
	
	return deferred.promise;
};
var getItemBySellSectionId = function(sellSectionId){
	console.log("begin sellrecognizer controller getItemBySellSectionId " + sellSectionId);
	var deferred = q.defer();		
	
	sellService.getItemBySellSectionId(sellSectionId)
		.then(function(res){
			console.log("sellrecognizer controller getItemBySellSectionId " + res);
			var res =  {
				Data : res,
				Message: "",
				Status: 1
			};
			deferred.resolve(res);
		}		
	);
	
	return deferred.promise;
};
module.exports =
{
	searchImage : searchImage,
	insertItem: insertItem,
	getItemById: getItemById,
    getItemsByOwnerId: getItemsByOwnerId,
    getItemBySellSectionId: getItemBySellSectionId
}