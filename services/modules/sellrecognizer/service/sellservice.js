var q = require('q');
var sellrepo = require("../repo/mongodb");
var uuid = require("uuid");

var insertItem = function(item){    	
    if (item.id === undefined){   
        item.id =  uuid.v4();    
    }
    return sellrepo.insertItem(item);
};
var getItemById = function(id){    	   
    return sellrepo.getItemById(id);
};
var getItemsByOwnerId = function(ownerId, pageNum, pageSize){    	   
    return sellrepo.getItemsByOwnerId(ownerId, pageNum, pageSize);
};
var getItemBySellSectionId = function(sellSectionId){    	   
    return sellrepo.getItemBySellSectionId(sellSectionId);
};
module.exports =
{	
    insertItem: insertItem,
    getItemById: getItemById,
    getItemsByOwnerId: getItemsByOwnerId,
    getItemBySellSectionId: getItemBySellSectionId
}