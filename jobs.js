// OpenShift Node application
var fs = require('fs');
var mongoose = require('mongoose');
var request = require('request');
var uniqueValidator = require('mongoose-unique-validator');


// Config Init
var authorization = process.env.API_AUTH_TOKEN || 'pyxJlrgpjmuIyArtVbC6pTptgQ04vO31kpZ89xZ3';
var baseURL = 'https://www.roosterteeth.com/api/v1/feed';
var connection_string = 'mongodb://localhost:27017/';
var data = [];
var db = 0;
var count = 200;
var optionsArray = [];
var page = 1;
var siteArray = ['roosterteeth','achievementHunter','theknow','funhaus','screwattack'];
var type = 'episode'


// Table row schema
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    rtID: {type: Number, unique: true},
    title: String,
    caption: String,
    sponsor: Boolean,
    site: String,
    duration: Number,
    image: String,
    show: String,
    season: String,
    link: String,
});

recordSchema.plugin(uniqueValidator);

var Record = mongoose.model('Record', recordSchema);


if (!process.env.OPENSHIFT_DATA_DIR) {
    process.env.OPENSHIFT_DATA_DIR = '';
}

connect(db);

function connect(db) {
    if (db == siteArray.length) {
        console.log('Job Completed');
        fs.writeFile(process.env.OPENSHIFT_DATA_DIR + 'archive.json', JSON.stringify(data), (err) => {
            if (err) throw err;
            return process.exit();
        });
    }

    // if OPENSHIFT env variables are present, update connection string:
    if(process.env.MONGOLAB_PASS_ADMIN){
        connection_string = 'mongodb://' +
        process.env.MONGOLAB_USER_ADMIN + ":" +
        process.env.MONGOLAB_PASS_ADMIN + "@" +
        process.env.MONGOLAB_HOST + ':' +
        process.env.MONGOLAB_PORT + '/' + siteArray[db]
    } else {
        connection_string + siteArray[db];
    }

    mongoose.connect(connection_string);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));  

    conn.once('open', function() {
        console.log('MongoDB connection successful: ' + connection_string + siteArray[db]);
        reqFunc(siteArray[db], writeDB);
    });
}

function reqFunc(site, callback) {

    var options = { method: 'GET',
        url: baseURL,
        qs: 
        { 
            count: count,
            page: page,
            site: site,
            type: type 
        },
        headers: { authorization: authorization } 
    };

    // Make the request
    request(options, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        if(error || response.statusCode !== 200) {
            console.log("Error received - Status code: " + response.statusCode);
            return;
        }

        var body = JSON.parse(body);
        if (body.length > 0) {
            console.log(body.length + ' results');
            callback(body, reqFunc);    
        } else {
            mongoose.connection.close(function(){
                console.log(siteArray[db] + ' complete');
                page = 1;
                db++;
                connect(db);
            });
        }
        
    });
}

function writeDB(array, callback) {
    
    for (var i = 0; i < array.length; i++) {
        var item = array[i].item;

        var row = new Record({ 
            rtID: item.id,
            title: item.title, 
            caption: item.caption, 
            sponsor: item.sponsorOnly, 
            site: item.site,
            duration: item.length,
            image: item.profilePicture.content.lg,
            show: item.show.name,
            season: item.season.title,
            link: item.canonicalUrl
        });

        row.save(function(err) {
            if (err) { return; }
        });

        data.push(row);
    }
    
    console.log(siteArray[db] + ' - ' + page + ' complete');
    page++;
    callback(siteArray[db], writeDB);
    
}

