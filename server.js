// SETUP
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();

var server = require('./app/models/connect.js');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var port = process.env.PORT || 8080;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// Routes 
require('./app/routes.js')(app);

exports.init = function () {
    // Listen - Start App when connection established
    app.listen(server_port, server_ip_address, function () {
        app.get('*', function(req, res) {
            res.sendFile(__dirname + '/public/index.html'); 
        });
        console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
    });
}

server.connect(0);






