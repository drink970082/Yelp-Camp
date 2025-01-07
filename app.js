/* import modules */
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment
const ejsMate = require('ejs-mate'); // ejs-mate is a layout engine for ejs
const { campgroundSchema } = require('./schemas.js'); // import the schema for the campground data
const catchAsync = require('./utils/catchAsync'); // catchAsync is a function that wraps async functions to catch errors
const ExpressError = require('./utils/ExpressError'); // ExpressError is a class that extends the Error class
const methodOverride = require('method-override'); // method-override is a middleware that allows the use of HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const Campground = require('./models/campground'); // import the Campground model

/* connect to mongodb with name "yelp-camp" */
mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

/* building an event listener to check if connection is successful */
const db = mongoose.connection; // shortcut to mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

/* express app */
const app = express();

/* setting up ejs, building dynamic html */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* setting up ejs-mate */
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/* server-side validation with Joi, throw an ExpressError if the campground data is invalid */
const validateCampground = (req, res, next) => {
    // validate the request body with the campgroundSchema, return error(s)(an array) if invalid
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message =error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    }
    else {
        // if no error then pass it to the route handler
        next();
    }
};

/* home route */
app.get('/', (req, res) => {
    res.render('home');
});

/* show all campgrounds */
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}) // fetch all campgrounds
    res.render('campgrounds/index', { campgrounds }); // render index.ejs with campgrounds data
}));

/* add new campground */
app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

/* 
    receive post request from new campground form, save it to db and redirect to the page of that campground
    we'll do server-side validation to the campground data before saving it to the db (validateCampground)
*/
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

/* show details of a campground */
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); // fetch campground by id
    res.render('campgrounds/show', { campground });
}));

/* edit campground */
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

/* 
    receive put request from edit campground form, save it to db and redirect to the page of that campground 
    we'll do server-side validation to the campground data before saving it to the db (validateCampground)
*/
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
}));

/* delete campground */
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

/* route handler that triggers when visiting a route that doesn't exist */
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

/* error handling: triggered when an error is passed to next()(for async) or throw()(for sync) */
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});

/* start server */
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});