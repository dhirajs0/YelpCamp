const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('home');
})

/*
To Send Hello 
app.get('/', (req, res) => {
    res.send('Hello from YelpCamp');
})
*/
app.listen(3000, () =>{
    console.log('Serving on Port 3000 ');
})