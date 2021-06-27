const express = require('express');
const path = require('path');   // to join view dir
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // view engine
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

// to join public dir
app.use(express.static(path.join(__dirname, 'public')))

// session config
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// home page
app.get('/', (req, res) => {
    res.render('home')
});

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
app.listen(3000, () => {
    console.log('Serving on port 3000')
})

