
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");


var dateLong = function(){
	var d = new Date();
    var n = d.getTime();
    return n;
};
module.exports =
{	
	dateLong : dateLong	 
}