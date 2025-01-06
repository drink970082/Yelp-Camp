/* import modules */
const express = require('express');
const cities = require('./cities');
const mongoose = require('mongoose');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

/* connect to mongodb with name "yelp-camp" */
mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

/* building an event listener to check if connection is successful */
const db = mongoose.connection; // shortcut to mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

/* function to get a random element from an array */
const sample = array => array[Math.floor(Math.random() * array.length)];

/* function to seed the database using data from seedHelper and citites */
const seedDB = async () => {
    await Campground.deleteMany({}); // delete all campgrounds
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        })
        await camp.save();
    }
}

// seeding the database, then close connection after seeding is done
seedDB().then(() => {
    mongoose.connection.close();
}); 