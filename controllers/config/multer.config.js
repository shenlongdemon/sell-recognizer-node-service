var multer = require('multer');
var _ = require('underscore');
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./static/portal/uploads");
    },
    filename: function (req, file, callback) {        
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count

module.exports = upload;