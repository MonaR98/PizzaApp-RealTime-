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
//flash is use to flash all the required messages to the end user
const flash = require('express-flash');
const MongoStore=require('connect-mongo');
const passport = require('passport');
const emitter = require('events');


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

//Event emmitter
const eventEmitter =new emitter();
app.set('eventEmitter', eventEmitter); //by binding this eventemitter with our app like we did here, we can use this event anywhere in the app
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


//Passposrt config and it shoud be done right after session config
const passportInit = require('./app/config/passport');
const { Socket } = require('socket.io');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session())


app.use(flash());

//Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended:false}))
app.use(express.json())

//GLobal middlware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})



//set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);




const server = app.listen(PORT, () => {
    console.log(`Listening on port no ${PORT}`)
})

//socket

const io = require('socket.io')(server);
io.on('connection',(socket) => {
    //Join
    socket.on('join', (roomName) => { //here join is the name of the event which was emitted by the client i.e. in the app.js file@line no 81 
        socket.join(roomName)  //here, this join is the method of socket to create a room for communication
    })
})

eventEmitter.on('orderUpdated', (data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced', data)
})