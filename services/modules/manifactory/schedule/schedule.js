
var version = "Add version when return data" + "" ;
var _ = require('underscore');
var schedule = require('node-schedule');
var service = require('../service/manifactoryservice');
var jobs = [];
var start = function(){
    global.itemIdsToUpdateBeaconLocation = [];
    console.log("run schedule of sellrecognizer");
    var j = {};
    schedule.scheduleJob('0 */1 * * * *', function(){       
        service.updateAllBeaconLcationEachMinute(0);
    });
    return j;      
};
module.exports =
{	
    start: start
}