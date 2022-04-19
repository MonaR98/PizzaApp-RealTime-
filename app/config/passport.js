//file to configure passport

const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt =require('bcrypt');

function init(passport){
    passport.use(new LocalStrategy({ usernameField:'email'}, async (email, password, done)=>{
        //Login login
        //Check if the email exists 
        const user = await User.findOne({ email : email});
        if(!user){
            return done(null, false, { message: 'No user exists with these credentials!'})
        }
        bcrypt.compare(password, user.password).then(match => {
            if(match){
                return done(null,user, { message:'Logged In successfully!' })
            }
            return done(null, false, { message: 'Wrong Username or Password!' })
        }).catch(err => {
            return done(null, false, { message: 'Something went wrong!' })
        })
}))
//If user logs in successfully then we need to store some user info in the session. Usually we store the user id
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

//This method enables us to get the logged in user
    passport.deserializeUser((id, done) =>{
       // User.findOne({ _id: id })
       User.findById(id, (err,user) => {
           done(err,user)
       })
    })
    
}

module.exports = init;