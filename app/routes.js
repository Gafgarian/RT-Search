var e = require('./models/app');

var rt = e.rt;
var ah = e.ah;
var tk = e.tk;
var fh = e.fh;
var sa = e.sa;

var schemaArray = [rt, ah, tk, fh, sa];

function getShows(res) {
    var count = 0;
    var episodeArray = [];

    function dbFind() {
        var collection = schemaArray[count];

        collection.find(function (err, episodes) {
            if (err) {
                res.send(err);
            }
            count++;
            return concatArray(episodes, dbFind);
        });
    }

    function concatArray(episodes, callback) {
        episodeArray = episodeArray.concat(episodes);
        if (count != schemaArray.length) {
            return callback();
        }
        res.json(episodeArray);
    }

    dbFind();
};

module.exports = function (app) {
    // Retrieve all shows
    app.get('/api/shows', function (req, res) {
        // use mongoose to get all shows in the database   
        getShows(res);
    });

};
