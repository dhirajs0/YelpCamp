const express = require('express'); 
const path = require('path');  // to join view dir
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');  // view engine
const { campgroundSchema } = require('./schemas.js'); // joi schema for server side validation
const catchAsync = require('./utils/catchAsync');  
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');


// connect to database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection; // to use only db 
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});


const app = express();

// ejsMate set as engine
app.engine('ejs', ejsMate);

// view engine set to ejs
app.set('view engine', 'ejs');

// views path joined
app.set('views', path.join(__dirname, 'views'));

// middleware for parsing req body
app.use(express.urlencoded({ extended: true }));

// to overide the post method to put or delete in form 
app.use(methodOverride('_method'));

// server side validation of campground
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// validation of review 
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



// home page
app.get('/', (req, res) => {
    res.render('home'); 
})

//campground page
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds}); 
}))

// get: new campground addition
app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new');
})

// post: new campground addition
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// get campground by id
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground  = await Campground.findById(req.params.id);
    res.render('campgrounds/show',{campground}); 
}));

// get:  edit campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

// put: edit campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// to post new reviews
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// to delete review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


// for rest all routes: page not found error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// app listening
app.listen(3000, () =>{
    console.log('Serving on Port 3000 ');
})