
var version = "Add version when return data" + "" ;
var _ = require('underscore');
var schedule = require('node-schedule');
var sellservice = require('../service/sellservice');
var jobs = [];
var start = function(){
    console.log("run schedule of sellrecognizer");
    var j = schedule.scheduleJob('0 */1 * * * *', function(){       
        sellservice.updateAllOwnerCode();
    });
    return j;      
};
module.exports =
{	
    start: start
}