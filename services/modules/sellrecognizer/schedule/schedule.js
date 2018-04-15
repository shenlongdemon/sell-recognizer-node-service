
var version = "Add version when return data" + "" ;
var _ = require('underscore');
var schedule = require('node-schedule');
var sellservice = require('../service/sellservice');
var jobs = [];
var start = function(){
    console.log("run schedule of sellrecognizer");
    var j = schedule.scheduleJob('0 */1 * * * *', function(){
        var date = new Date();
        var time = date.getTime();
        var OMID_CODE = "OMID_CODE" + time;
        sellservice.updateAllOwnerCode(OMID_CODE);
    });
    return j;      
};
module.exports =
{	
    start: start
}