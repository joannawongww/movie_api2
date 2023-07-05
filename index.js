const express = require('express'),
        bodyParser = require('body-parser'),
        uuid = require('uuid'),
        morgan = require('morgan'),
        fs = require('fs'),
        path = require('path');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

//create write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'});

//set up logger
app.use(morgan('combined', {stream: accessLogStream}));

// in-memory 
let users = [
    {
        id: 1,
        name: "Kim",
        favouritesMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favouritesMovies: ["movie3"]
    },
];

let movies = [
    {
        "Title": "Movie1",
        "Description": "enter description of movie1",
        "Genre": {
            "Name":"Drama",
            "Description": "enter description of genre"
        },
        "Director": {
            "Name": "director1",
            "Bio": "director 1 bio",
            "Birth": "1969"
        },
        "ImageURL": "#",
        "Featured":false
    },

    {
        "Title": "Movie2",
        "Description": "enter description of movie 2",
        "Genre": {
            "Name":"Thriller",
            "Description": "enter description of genre"
        },
        "Director": {
            "Name": "director2",
            "Bio": "director 2 bio",
            "Birth": "1922"
        },
        "ImageURL": "#",
        "Featured":false
    },

    {
        "Title": "Movie3",
        "Description": "enter description of movie 3",
        "Genre": {
            "Name":"Horror",
            "Description": "enter description of genre"
        },
        "Director": {
            "Name": "director3",
            "Bio": "director 3 bio",
            "Birth": "1933"
        },
        "ImageURL": "#",
        "Featured":false
    },

    {
        "Title": "Movie 4",
        "Description": "enter description of movie 4",
        "Genre": {
            "Name":"Romantic",
            "Description": "enter description of genre"
        },
        "Director": {
            "Name": "director 4",
            "Bio": "director 4 bio",
            "Birth": "1944"
        },
        "ImageURL": "#",
        "Featured":false
    },

    {
        "Title": "Movie 5",
        "Description": "enter description of movie 5",
        "Genre": {
            "Name":"Drama",
            "Description": "enter description of genre"
        },
        "Director": {
            "Name": "director 5",
            "Bio": "director 4 bio",
            "Birth": "1944"
        },
        "ImageURL": "#",
        "Featured":false
    },


];

app.get('/', (req,res) => {
    res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});


// CREATE - new user register
app.post('/users', (req, res) => {
    const newUser = req.body; //doable because of app.use(bodyParser) - read data from body object

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need names')
    }

})

// UPDATE - user update username
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('user id not found')
    }
    
})

// CREATE - user add movie to favourites
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.favouritesMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('user id not found')
    }
    
})

// DELETE - users remove movie from favourites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.favouritesMovies = user.favouritesMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('user id not found')
    }
    
})

// DELETE - user deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('user id not found')
    }
    
})

//READ list of movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies); 
})

//READ - find movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title ); 

    if (movie) {
        res.status(200).json(movie); 
    }else{
        res.status(400).send('no such movie')
    }
})

//READ - return genre data by title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre; 

    if (genre) {
        res.status(200).json(genre); 
    }else{
        res.status(400).send('no such genre')
    }
})

//READ - return director data by name
app.get('/movies/directors/:directorName', (req,res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director; 

    if (director) {
        res.status(200).json(director); 
    }else{
        res.status(400).send('no such director')
    }
})

//error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

//listen req
app.listen(8080, () => {
    console.log('myFlix is running on port 8080');
});