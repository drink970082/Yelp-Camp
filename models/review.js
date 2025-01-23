const mongoose = require('mongoose');
const Schema = mongoose.Schema; // just a shortcut to reference schema

const reviewSchema = new Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model('Review', reviewSchema);