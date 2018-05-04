
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];


var dateLong = function(){
	var d = new Date();
    var n = d.getTime();
    return n;
};
var convertStringToNumWithDescription = function(str) {
    var code = "";
    var description = ""
    Array.from(str).map((c, key) => {

        _.map(STRS, function (STR, index) {
            var idx = STR.indexOf(c);
            if (idx > -1) {
                code += index + "" + idx;
                description += c;
            }
        });

    });
    var res = {
        code: code,
        str:description
    }
    return res;
}
var genInfoCode = function(action, owner) {

    var allStr = " " + action + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coords.latitude + "," + owner.position.coords.longitude + " " + owner.position.coords.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var data = convertStringToNumWithDescription(allStr);
    return data;

};

module.exports =
{	
    dateLong : dateLong	,
    convertStringToNumWithDescription:convertStringToNumWithDescription,
}