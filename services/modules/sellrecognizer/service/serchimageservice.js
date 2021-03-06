
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");

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
    apiKey: "AIzaSyCIFpX02yxf_azs1qwmn2feMDYUfQLqZDQ",
    cx: "004370175914457095242:a4ftrdtwhm4"
  };
var searchImage = function(obj){
	console.log("searchimageservice searchImage " + obj);
	var deferred = q.defer();	

	var options = _.clone(searchOptions);
	options.q = obj;

	customsearch.cse.list({
		cx: options.cx,
		q: options.q,
		searchType:"image",
		auth: options.apiKey
		}).then(function(json){
			console.log("sellrecognizer got searchImage");
			var items = _.map(json.data.items, function(item, index){ 
				return {link:item.link, title: item.title, index: index, id: uuid.v4()};
			});			
			console.log("sellrecognizer searchImage res = " + JSON.stringify(items));
			deferred.resolve(items);	
		});
    return deferred.promise;
};
module.exports =
{	
	searchImage : searchImage	 
}