const express = require('express'),
        bodyParser = require('body-parser'),
        uuid = require('uuid'),
        morgan = require('morgan'),
        fs = require('fs'),
        path = require('path');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

//allows Mongoose connect to database to perform CRUD
mongoose.connect('mongodb://localhost:27017/cfDB', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true}));

app.use(express.static('public'));

//create write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'});

//set up logger
app.use(morgan('combined', {stream: accessLogStream}));

// in-memory data
// let users = [
//     {
//         id: 1,
//         name: "Kim",
//         favouritesMovies: []
//     },
//     {
//         id: 2,
//         name: "Joe",
//         favouritesMovies: ["movie3"]
//     },
// ];

// let movies = [
//     {
//         "Title": "Movie1",
//         "Description": "enter description of movie1",
//         "Genre": {
//             "Name":"Drama",
//             "Description": "enter description of genre"
//         },
//         "Director": {
//             "Name": "director1",
//             "Bio": "director 1 bio",
//             "Birth": "1969"
//         },
//         "ImageURL": "#",
//         "Featured":false
//     },

//     {
//         "Title": "Movie2",
//         "Description": "enter description of movie 2",
//         "Genre": {
//             "Name":"Thriller",
//             "Description": "enter description of genre"
//         },
//         "Director": {
//             "Name": "director2",
//             "Bio": "director 2 bio",
//             "Birth": "1922"
//         },
//         "ImageURL": "#",
//         "Featured":false
//     },

//     {
//         "Title": "Movie3",
//         "Description": "enter description of movie 3",
//         "Genre": {
//             "Name":"Horror",
//             "Description": "enter description of genre"
//         },
//         "Director": {
//             "Name": "director3",
//             "Bio": "director 3 bio",
//             "Birth": "1933"
//         },
//         "ImageURL": "#",
//         "Featured":false
//     },

//     {
//         "Title": "Movie 4",
//         "Description": "enter description of movie 4",
//         "Genre": {
//             "Name":"Romantic",
//             "Description": "enter description of genre"
//         },
//         "Director": {
//             "Name": "director 4",
//             "Bio": "director 4 bio",
//             "Birth": "1944"
//         },
//         "ImageURL": "#",
//         "Featured":false
//     },

//     {
//         "Title": "Movie 5",
//         "Description": "enter description of movie 5",
//         "Genre": {
//             "Name":"Drama",
//             "Description": "enter description of genre"
//         },
//         "Director": {
//             "Name": "director 5",
//             "Bio": "director 4 bio",
//             "Birth": "1944"
//         },
//         "ImageURL": "#",
//         "Featured":false
//     },


// ];

app.get('/', (req,res) => {
    res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});


//READ list of movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch( (err) => {
            console.error(err);
            res.status(500).send('Error: ' + err)
    });
});

//READ - list of users
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch( (err) => {
            console.error(err);
            res.status(500).send('Error: ' + err)
    });
});


//READ - find movie by title
app.get('/movies/:title', (req, res) => {
    Movies.findOne( {title: req.params.title})
    .then((movie) => {
        res.json(movie);
    })
    .catch( (err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//READ - return genre data by name
app.get('/genre/:Name', (req, res) => {
    Genres.findOne( {Name: req.params.Name})
    .then( (genre) => {
        res.json(genre.Description);
    })
    .catch((err)=> {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//READ - return director data by name
app.get('/director/:Name', (req, res) => {
    Directors.findOne( {Name: req.params.Name})
    .then( (director) => {
        res.json(director);
    })
    .catch((err)=> {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


// CREATE - new user register
app.post('/users', (req, res) => {
    Users.findOne( {Username: req.body.Username})
        .then( (user) => { 
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            }else{
                Users.create( {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
        })
        .then((user) => {
            res.status(201).json(user)
        })
        .catch( (error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
    }
}).catch( (error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
});
});

// UPDATE - user update username
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate (
        { Username: req.params.Username},
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

// CREATE - user add movie to favourites
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate( {Username: req.params.Username},
        {$push: {Favorite: req.params.MovieID}},
        {new: true},
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }  
        
    );
});

// DELETE - users remove movie from favourites
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate( {Username: req.params.Username},
        {$pull: {Favorite: req.params.MovieID}},
        {new: true},
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }  
        
    );
});
// DELETE - user deregister
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove ({ Username: req.params.Username})
    .then( (user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted');
        }
    }).catch( (err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// //error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

//listen req
app.listen(8080, () => {
    console.log('myFlix is running on port 8080');
});