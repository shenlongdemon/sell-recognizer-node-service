const http         = require('http'),
fs           = require('fs'),
path         = require('path'),
compression  = require('compression'),
express 	   = require("express"),
bodyParser   = require("body-parser"),      
env          = process.env,
controller   = require("./controllers/controller"),
mongodb      = require("./services/modules/sellrecognizer/repo/mongodb"),
schedule     = require("./schedule/schedule")
;
var app = express();

app.use(compression({
  filter: function () { return true; }
}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json({ limit: '5mb' }));


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/static'));

app.get("/", function (req, res){
	res.sendFile("/index.html");
});

app.get("/api/:service/:action", controller.doget);
app.post("/api/:service/:action", controller.dopost);


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
schedule.start();


