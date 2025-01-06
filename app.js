/* import modules */
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

/* home route */
app.get('/', (req, res) => {
    res.render('home');
});

/* show all campgrounds */
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({}) // fetch all campgrounds
    res.render('campgrounds/index', { campgrounds }); // render index.ejs with campgrounds data
});

/* add new campground */
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});

/* receive post request from new campground form, save it to db and redirect to the page of that campground */
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

/* show details of a campground */
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id); // fetch campground by id
    res.render('campgrounds/show', { campground });
});

/* edit campground */
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

/* receive put request from edit campground form, save it to db and redirect to the page of that campground */
app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) 
    res.redirect(`/campgrounds/${campground._id}`);
});

/* delete campground */
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

/* start server */
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});