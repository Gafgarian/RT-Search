var mongoose = require('mongoose');

var episodeSchema = new mongoose.Schema({
  title: String,
  link: String,
  image: String,
  uploaded: String,
  duration: String,
  sponsor: Boolean
});

module.exports = mongoose.model('Records', episodeSchema);
