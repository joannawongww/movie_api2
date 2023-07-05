//same key used in JWTStrategy
const jwtSecret = 'your_jwt_secret';

const jwt = require('jwtwebtoken'),
    passport = require('passport');

//local passport file
require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret), {
        subject: user.Username, //username encoding in JWT
        expiresIn: '7d', //token will expire in 7 days
        algorithm: 'HS256' //algorithn used to "sign" or encode values of JWT
    };
}

//POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token }); //this returns the token
            });
        })(req, res);
    })
}