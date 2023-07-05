const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

// .FINDONE() NO LONGER ACCEPT CALLBACK
// passport.use(new LocalStrategy(
//     {
//     usernameField: 'Username',
//     passwordField: 'Password'
//     }, 
// (username, password, callback) => {
//     console.log(username + ' ' + password);
//     Users.findOne({Username: username}, (error, user) => {
//         if (error){
//             console.log(error);
//             return callback(error);
//         }

//         if (!user) {
//             console.log('incorrect username');
//             return callback(null, false, {message: "Incorrect username or password."});
//         }

//         console.log('finished');
//         return callback(null, user);
//     });
// }));

// module.exports = (router) => {
//     router.post('/login',
//   // wrap passport.authenticate call in a middleware function
//   function (req, res, next) {
//     // call passport authentication passing the "local" strategy name and a callback function
//     passport.authenticate('local', function (error, user, info) {
//       // this will execute in any case, even if a passport strategy will find an error
//       // log everything to console
//       console.log(error);
//       console.log(user);
//       console.log(info);

//       if (error) {
//         res.status(401).send(error);
//       } else if (!user) {
//         res.status(401).send(info);
//       } else {
//         next();
//       }

//       res.status(401).send(info);
//     })(req, res);
//   },

//   // function to call once successfully authenticated
//   function (req, res) {
//     res.status(200).send('logged in!');
//   });
// }

passport.use(new LocalStrategy(
    {
        usernameField: 'Username',
        passwordField: 'Password'
    },
    (username, password, callback) => {
        console.log(username + ' ' + password);
        Users.findOne( {Username: username})
        .then( (user) => {
            if (!user) {
                console.log('incorrect username');
                return callback(null, false, {message: "incorrect username or password."});
            }

            console.log('finished');
            return callback(null, user);

        }).catch( (error) => {
            console.log(error);
            return callback(error);
        })
    }
))


    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    }, (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
    }));