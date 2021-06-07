const mongoose = require('mongoose');
const Schema = mongoose.Schema; // to use Schema next time

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: String,
    description: String,
    location: String 
});

module.exports = mongoose.model('Campground', CampgroundSchema);