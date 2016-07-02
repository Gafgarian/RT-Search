var mongoose = require('mongoose');

var episodeSchema = new mongoose.Schema({
    rtID: Number,
    title: String,
    caption: String,
    sponsor: String,
    site: String,
    duration: String,
    image: String,
    show: String,
    season: String,
    link: String
});

module.exports = mongoose.model('Records', episodeSchema);
