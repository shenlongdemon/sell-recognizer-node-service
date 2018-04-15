
var version = "Add version when return data" + "";
var _ = require('underscore');
var schedule = require('node-schedule');
var taskUpdateOMID = require('../services/modules/sellrecognizer/schedule/schedule');
var jobs = [];
var start = function () {
    var j = taskUpdateOMID.start();
    jobs.push(j);
};
var stopAll = function () {
    _.each(function (idx, job) {
        job.cancel();
    });
};
module.exports =
    {
        start: start,
        stopAll: stopAll
    }