const mongoose = require('mongoose');
const Schema = mongoose.Schema; // just a shortcut to reference schema
const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema);