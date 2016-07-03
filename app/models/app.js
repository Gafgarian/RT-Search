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

exports.rt = mongoose.model('roosterteeth', episodeSchema);
exports.ah = mongoose.model('achievementhunter', episodeSchema);
exports.tk = mongoose.model('theknow', episodeSchema);
exports.fh = mongoose.model('funhaus', episodeSchema);
exports.sa = mongoose.model('screwattack', episodeSchema);

