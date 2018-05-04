var q = require('q');
var ubuilderrepo = require('../../sellrecognizer/repo/mongodb');
var common = require('../../common/common');

var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var _ = require('underscore');

var LZString = require('lz-string');
var MAX_DIGIT = 8;
var genUserInfo = function(user){
    
};
var getProjectsByOwnerId = function (ownerId, pageNum, pageSize) {
    return ubuilderrepo.getProjectsByOwnerId(ownerId, pageNum, pageSize);
};
var insertProject = function (proj) {
    proj.id = uuid.v4();
    proj.module = {
        tasks : []
    };
    var codeData = common.genUserInfo('[OWNER]',proj.owner);
    proj.owner.code = codeData.code;
    return ubuilderrepo.insertProject(proj);
};
module.exports =
{
    getProjectsByOwnerId: getProjectsByOwnerId,
    insertProject: insertProject,
}