const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController(){
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders';
    }

    return{
        login(req,res){
            res.render('auth/login');
        },

        postLogin(req,res,next){

            const {email, password } = req.body;

            //Validate request
            if(!email || !password){
                req.flash('error','*All fields are required!');
                return res.redirect('/login');
            }

            //definition of done method in return statement of the if(match)condition of the pasport.js file 
            //When we call this function, it will return a function
            passport.authenticate('local', (err, user, info)=>{
                 if(err){
                     req.flash('error', info.message)
                     return next(err)
                 }

                 if(!user){
                     req.flash('error',info.message);
                     return res.redirect('/login');
                 }

                 req.login(user, (err) => {
                     if(err){
                         req.flash('error',info.message);
                         return next(err);
                     }

                     return res.redirect(_getRedirectUrl(req));
                 })
            })(req, res, next) // calling the authenticate method of passport
        },

        register(req,res){
            res.render('auth/register');
        },
        async postRegister(req,res){
            const { name, email, password } = req.body;

            //Validate request
            if(!name || !email || !password){
                req.flash('error','*All fields are required!');
                //to keep the filled data as it is
                req.flash('name',name);
                req.flash('email',email);
                return res.redirect('/register');
            }

            //Check email exists or not
            User.exists({ email: email }, (err, res)=>{
                if(res){
                    req.flash('error','*This email already exists!');
                    //to keep the filled data as it is
                    req.flash('name',name);
                    req.flash('email',email);
                    return res.redirect('/register');
                }
            })
            //Hash the password
            const hashedPassword = await bcrypt.hash(password, 10)

            //Create a user
            const user = new User({
                name:name,
                email:email,
                //password must be hashed before storing in the db
                password:hashedPassword
            })
            user.save().then(()=>{
                //after successfull registration, redirect the user to the Login page
                return res.redirect('/');
            }).catch(err=>{
                req.flash('error','*Something went wrong!');
                    return res.redirect('/register');

            })
            console.log(req.body);
        },


        logout(req, res){
            req.logout();
            return res.redirect('/login');
        }
    }
}

module.exports=authController;