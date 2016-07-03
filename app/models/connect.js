var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var server = require('../../server.js');

var app = express();

// Config Init
var baseConnection = 'mongodb://localhost:27017/';
var baseURL = 'https://www.roosterteeth.com/api/v1/feed';
var connectionString;
var dataDir = process.env.OPENSHIFT_DATA_DIR || '';
var db = 0;
var siteArray = ['rtarchive','roosterteeth','achievementHunter','theknow','funhaus','screwattack'];

exports.config = function(db) {
    // if OPENSHIFT env variables are present, update connection string:
    if(process.env.MONGOLAB_PASS_ADMIN){
        return connection_string = 'mongodb://' +
        process.env.MONGOLAB_USER_ADMIN + ":" +
        process.env.MONGOLAB_PASS_ADMIN + "@" +
        process.env.MONGOLAB_HOST + ':' +
        process.env.MONGOLAB_PORT + '/' + siteArray[db]
    } else {
        return connection_string = baseConnection + siteArray[db];
    }
}

exports.connect = function(db) {

    var connection_string = this.config(db);

    console.log(connection_string);
    mongoose.connect(connection_string);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));  
    conn.once('open', function() {
        server.init();
    });
}
