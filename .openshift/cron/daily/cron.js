#!/usr/bin/env node

// OpenShift Node application
var express = require('express');
var app = express();
var fs = require('fs');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var JsonDB = require('node-json-db');
var request = require('request');
var cheerio = require('cheerio');

// Config Init
var baseURL = 'http://roosterteeth.com/episode/recently-added?page=';
var db;
var fullBuild = false;
var lastPage;
var linkArray = [];
var pageArray = [];
var pageCount = 0;
var resultsArray = [];
var updateArray = [];

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var schema = new mongoose.Schema({
  title:  String,
  link: String,
  uploaded: String,
  image:  String,
  sponsor: Boolean,
  duration: String,
});
var Record = mongoose.model('Record', schema);

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/rtarchive';

var port = process.env.PORT || 8080;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var data = process.env.OPENSHIFT_DATA_DIR || 'data/';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.MONGOLAB_PASS_ADMIN){
    connection_string = 'mongodb://' +
    process.env.MONGOLAB_USER_ADMIN + ":" +
    process.env.MONGOLAB_PASS_ADMIN + "@" +
    process.env.MONGOLAB_HOST + ':' +
    process.env.MONGOLAB_PORT + '/rtarchive'
}

console.log(connection_string);

mongoose.connect(connection_string);
var conn = mongoose.connection;             
conn.on('error', console.error.bind(console, 'connection error:'));  

conn.once('open', function() {
    // Listen - Start App when connection established
    console.log('MongoDB connection successful.');
    var build = new start();
    build.initialize();
    build.start();
});

/**
 * main(): Main code.
 */

 var start = function(){
    var self = this;
    self. initialize = function(){};
    self. start = function(){
        fs.readFile(process.env.OPENSHIFT_DATA_DIR + 'archive.json', function (err, data) {
          if (err) return console.log(err);
          linkArray = data;
        });
        setup();
    }
}

function setup() {
    var initUrl = baseURL + 1;
    reqFunc(initUrl, parse);
}

function reqFunc(url, callback) {

    // Make the request
    request(url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        if(error || response.statusCode !== 200) {
            console.log("Error received - Status code: " + response.statusCode);
            return;
        }

        // Parse the document body
        var $ = cheerio.load(body);
        callback($);
    });
}

// Parse request
function parse($) {
    if (pageCount === 0) {
        if (fullBuild) {
            lastPage = $('ul.controls a').eq(-2).text();
        } else {
            lastPage = 2;
        }
        var tempUrl;
        var tempArray = [];
        for (var i = 1; i <= lastPage; i++) {
            tempUrl = baseURL + i;
            tempArray.push(tempUrl);
        }
        pageArray = tempArray;     
    } else {
        baseLinks = $('main ul.episode-blocks a');
        baseLinks.each(function() {
            var base = $(this);
            var link = base.attr('href');

            var name = base.children('.name').html();
            var time = base.next().html();
            var image = 'http://' + base.find($('img')).attr('src');
            var sponsor = base.find($('.ion-star')).length > 0;
            var length = base.find($('.timestamp')).text();

            updateArray.push([name, link, time, image, sponsor, length]);
        });
    }
    if (pageCount < pageArray.length) {
        return gatherEpisodes();    
    } else {
        console.log('Build complete!');
        if (fullBuild) {
            linkArray = updateArray;
            var tempArray = [];
            for (var i = 0; i < linkArray.length; i++) {
                var item = {
                    'title': linkArray[i][0],
                    'link': linkArray[i][1],
                    'uploaded': linkArray[i][2],
                    'image': linkArray[i][3],
                    'sponsor': linkArray[i][4],
                    'duration': linkArray[i][5]
                }
                tempArray.push(item);
            }
            // Database creation
            writeDB(tempArray);
        } else {
            return updateDiff();
        }
    }
}

// Build results array
function gatherEpisodes() {
    pageCount++;
    console.log('Building page ' + pageCount + ' episode list');
    return reqFunc(pageArray[pageCount - 1], parse);
}

function updateDiff() {
    var tempArray = [];
    for (var i = 0; i < updateArray.length; i++) {
        if (updateArray[i][1] != linkArray[0][1]) {
            tempArray.push(updateArray[i]);
        } else {
            if (tempArray.length > 0) {
                tempArray.reverse();
                for (var i = 0; i < tempArray.length; i++) {
                    linkArray.unshift(tempArray[i]);    
                }
                console.log('Database updated with ' + tempArray.length + ' links.');                
            } else {
                console.log('    No new links found!');
            }
            break;
        }
    }
    writeDB(tempArray);
}

function writeDB(array) {
    for (var i = 0; i < array.length; i++) {
        var row = new Record({ 
            title: linkArray[i][0], 
            link: linkArray[i][1], 
            uploaded: linkArray[i][2], 
            image: linkArray[i][3], 
            sponsor: linkArray[i][4], 
            duration: linkArray[i][5] 
        });
        row.save(function(err) {
            if (err) throw err;
        });
    }
    fs.appendFile(process.env.OPENSHIFT_DATA_DIR + 'archive.json', JSON.stringify(array), function (err) {
        if (err) return console.log(err);
    });
    console.log('Job Completed');
    return process.exit();
}

