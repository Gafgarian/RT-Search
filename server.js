// SETUP
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Config Init
var baseConnection = 'mongodb://localhost:27017/';
var baseURL = 'https://www.roosterteeth.com/api/v1/feed';
var connectionString;
var dataDir = process.env.OPENSHIFT_DATA_DIR || '';
var db = 0;
var siteArray = ['roosterteeth','achievementHunter','theknow','funhaus','screwattack'];

var port = process.env.PORT || 8080;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// // if OPENSHIFT env variables are present, update connection string:
// if(process.env.MONGOLAB_PASS_ADMIN){
//     connection_string = 'mongodb://' +
//     process.env.MONGOLAB_USER_ADMIN + ":" +
//     process.env.MONGOLAB_PASS_ADMIN + "@" +
//     process.env.MONGOLAB_HOST + ':' +
//     process.env.MONGOLAB_PORT + '/'
// }

// for (var i = 0; i < siteArray.length; i++) {
// 	connection_string = connection_string + siteArray[i];
// }

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
 
// Routes 
require('./app/routes.js')(app);

exports.connect = function(db) {

    // if OPENSHIFT env variables are present, update connection string:
    if(process.env.MONGOLAB_PASS_ADMIN){
        connection_string = 'mongodb://' +
        process.env.MONGOLAB_USER_ADMIN + ":" +
        process.env.MONGOLAB_PASS_ADMIN + "@" +
        process.env.MONGOLAB_HOST + ':' +
        process.env.MONGOLAB_PORT + '/' + siteArray[db]
    } else {
		connection_string = baseConnection + siteArray[db];
    }

	console.log(connection_string);

    mongoose.connection.close(function(){
        console.log(siteArray[db] + ' closed');
    }).then(function(){
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
    });
}

exports.connect(0);



