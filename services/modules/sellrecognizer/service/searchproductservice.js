
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");
var sellSerivice =  require("./sellservice");
const {google} = require('googleapis');
const urlshortener = google.urlshortener('v1');
const customsearch = google.customsearch('v1');

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
	"489466368875-fp3lpk5td3t1s8ht1js8su4rravkgahb.apps.googleusercontent.com",
	"YHby2O65h-zTwmp4gAFp9Sx8",
	["urn:ietf:wg:oauth:2.0:oob","http://localhost"]
  );
google.options({
	auth: oauth2Client
});
const searchOptions = {    
    apiKey: "AIzaSyAikYi2mbNAqCBGIY5sLG8z38SGSkhR0M0",
    cx: "004370175914457095242:uggquoqgh3g"
  };


function getCurrency(item){
    var currency = "";
    try{
        currency = item.pagemap.hproduct[0].currency || "";
    } catch(e){}
    if (currency == ""){
        try{
            currency = item.pagemap.offer[0].pricecurrency || "";
        } catch(e){}
    }
    if (currency == ""){
        try{
            currency = item.pagemap.product[0].pricecurrency || "";
        } catch(e){}
    }
    return currency;
}
function getPrice(item){
    var price = "";
    try{
        price = item.pagemap.hproduct[0].price || "";
    } catch(e){}
    if(price == ""){
        try{
            price = item.pagemap.offer[0].price || "";
        } catch(e){}
    }
    if(price == ""){
        try{
            price = item.pagemap.product[0].price || "";
        } catch(e){}
    }
    return price;
}
function getRating(item){
    var rate = -1;
    try{
        rate = parseFloat(item.pagemap.aggregaterating[0].ratingvalue || -1);
    } catch(e){}
    if(rate < 0){
        try{
            rate = parseFloat(item.pagemap.review[0].ratingstars || -1);
        } catch(e){}
    }   
    if(rate < 0){
        try{
            var ratings = item.pagemap.rating || [];
            var total = 0;
            for(var i = 0; i < ratings.length; i++){
                total += parseFloat(ratings[i].ratingvalue || 0);
            }
            rate = total / ratings.length
        } catch(e){}
    }    
    return Math.round(rate);
}
function getImageLink(item){
    var link = "";
    try{
        link = item.pagemap.cse_thumbnail[0].src || "";
    } catch(e){}
    if (link == ""){
        try{
            link = item.pagemap.product[0].thumbnailurl || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.product[0].image || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.imageobject[0].contenturl || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.thumbnail[0].src || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.hproduct[0].photo || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.cse_image[0].src || "";
        } catch(e){}
    }
    if (link == ""){
        try{
            link = item.pagemap.imageobject[0].contenturl || "";
        } catch(e){}
    }
    return link;
}
function getReviews(item){
    var reviews = [];
    try{
        var rvs = item.pagemap.review || [];
        for(var i = 0; i < rvs.length; i++){
            try{
                if (rvs[i].description !== undefined && rvs[i].description !== ""){
                    
                    reviews.push(
                        {
                            id: uuid.v4(),
                            description : rvs[i].description
                        }                        
                    );
                }
            } catch(e){}
        }
    } catch(e){}
    try{
        var brvs = item.pagemap.hreview || [];
        for(var i = 0; i < brvs.length; i++){
            try{
                if (brvs[i].description !== undefined && brvs[i].description !== ""){
                    reviews.push(
                        {
                            id: uuid.v4(),
                            description : brvs[i].description
                        }                           
                    );
                }
            } catch(e){}
        }
    } catch(e){}
    return reviews;
}
var searchProduct = function(obj){
	console.log("searchproductservice searchProduct " + obj);
	var deferred = q.defer();	
    var list = [];
	var options = _.clone(searchOptions);
	options.q = obj;
    var searchServiceCount = 0;
    var SERVICES = 1;

	customsearch.cse.list({
		cx: options.cx,
		q: options.q,
		//searchType:"image",
		auth: options.apiKey
		}).then(function(json){
			console.log("sellrecognizer got searchProduct");
			var items = _.map(json.data.items, function(item, index){ 
				return {
                    link: item.link,   
                    image: getImageLink(item),                       
                    title: item.title, 
                    index: index, 
                    id: uuid.v4(),
                    reviews: getReviews(item),                    
                    currency : getCurrency(item),
                    price: getPrice(item),                    
                    rate: getRating(item),
                    raw: item,
                    type: 1 // search on web
                };
			});
			
            console.log("sellrecognizer searchImage res = " + JSON.stringify(items));            
            var res = {
                items: items,
                raw : json.data.items
            };
            searchServiceCount += 1;
            if(searchServiceCount == SERVICES){
                deferred.resolve(items);	
            }
		});
    return deferred.promise;
};
module.exports =
{	
	searchProduct : searchProduct	 
}