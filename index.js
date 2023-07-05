const express = require('express'),
        morgan = require('morgan'),
        fs = require('fs'),
        path = require('path');

const app = express();

//create write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'});

//set up logger
app.use(morgan('combined', {stream: accessLogStream}));

let topMovies = [];

app.use(express.static('public'));

//GET request
app.get('/', (req,res) => {
    res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

//listen req
app.listen(8080, () => {
    console.log('myFlix is running on port 8080');
});