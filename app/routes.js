var episode = require('./models/app');

function getShows(res) {
    episode.find(function (err, episodes) {
        if (err) {
            res.send(err);
        }
        res.json(episodes);
    });
};

module.exports = function (app) {

    // Retrieve all shows
    app.get('/api/shows', function (req, res) {

        // use mongoose to get all shows in the database
        getShows(res);
    });
    
};