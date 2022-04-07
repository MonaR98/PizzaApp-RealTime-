//this is to get access to all the variables declared in .env file
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore=require('connect-mongo');

//Database Connection
const url='mongodb://localhost/pizza-app';
mongoose.connect(url,{useUnifiedTopology:true, 
},err =>{
    if(err) throw err;
    console.log("connected!!")
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected....');
}).on('error', (err) => {
    console.log('Connection failed...');
});

// const connection =  mongoose.createConnection('mongodb://localhost/pizza-app');


// session store
let mongoStore = MongoStore.create({
                     mongoUrl:url,
                     collectionName:'sessions',
                })

//session config
app.use(session({
   // secret: process.env.COOKIE_SECRET,
    secret :'ThisIsASecret',
    resave: false,
    saveUnintialized : false, 
    store: mongoStore,
    //cookie validation period assigned to 24hrs 
    cookie:{ maxAge: 1000 * 60 * 60 * 24 }
    //session validity set to 15secs
    //cookie:{ maxAge: 1000 * 15 }
}))

app.use(flash());

//Assets
app.use(express.static('public'));


app.use(express.json())

//GLobal middlware
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})


//set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);




app.listen(PORT, () => {
    console.log(`Listening on port no ${PORT}`)
})