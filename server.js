// SETUP
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


// CONFIG
var port = process.env.PORT || 8080;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var data = process.env.OPENSHIFT_DATA_DIR || 'data/';

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/rtarchive';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.MONGOLAB_PASS_GLOBAL){
  connection_string = 'mongodb://' +
  process.env.MONGOLAB_USER_GLOBAL + ":" +
  process.env.MONGOLAB_PASS_GLOBAL + "@" +
  process.env.MONGOLAB_HOST + ':' +
  process.env.MONGOLAB_PORT + '/rtarchive'
}

console.log(connection_string);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
 
// Routes 
require('./app/routes.js')(app);

// Connect Init 
mongoose.connect(connection_string);
var conn = mongoose.connection;             
conn.on('error', console.error.bind(console, 'connection error:'));  
 
conn.once('open', function() {
	// Listen - Start App when connection established
	app.listen(server_port, server_ip_address, function () {
		app.get('*', function(req, res) {
			res.sendFile(__dirname + '/views/index.html'); 
		});
	  	console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
	});
});
