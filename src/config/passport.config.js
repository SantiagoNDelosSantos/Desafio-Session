import passport from 'passport';
import GithubStrategy from 'passport-github2';
import userModel from '../daos/mongodb/models/users.model.js';


// import local from 'passport-local';
// import {createHash, isValidPassword} from '../utils.js';

const initializePassport = () => {

    passport.use( 'github', new GithubStrategy({
                clientID:"Iv1.8dff530e6f620e73", clientSecret:"f2cadb654d2ea6c76f5bb37cbd62f1bc1a4af805", callbackURL: "http://localhost:8080/api/sessions/githubcallback",
            }, async (accessToken, refreshToken, profile, done) => {
                let user = await userModel.findOne({email: profile._json.email})
                if(!user){
                    let newUser = {
                        first_name: profile._json.name, 
                        last_name: "X",
                        email: "X"// profile._json.email
                        ,
                        age: 19, 
                        password: "X",
                        role: "User"
                    }
                    console.log(newUser)
                const result = await userModel.create(newUser)
                done(null, result)
                } else {
                    done(null, false)
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;