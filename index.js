const http         = require('http'),
fs           = require('fs'),
path         = require('path'),
compression  = require('compression'),
express 	 = require("express"),
bodyParser   = require("body-parser"),      
env          = process.env,
controller   = require("./controllers/controller"),
mongodb      = require("./services/modules/sellrecognizer/repo/mongodb"),
schedule     = require("./schedule/schedule"),
stringify   = require('json-stringify-safe')
;
global.OMID_CODE = "";

var app = express();

app.use(compression({
  filter: function () { return true; }
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/static/portal'));

app.get("/", function (req, res){
	res.sendFile("/index.html");
});

app.post("/api/upload/:service/:action", controller.doupload);
app.get("/api/:service/:action", controller.doget);
app.post("/api/:service/:action", controller.dopost);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
schedule.start();


