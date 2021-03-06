const express = require('express');

const cookieParser = require('cookie-parser');

const app = express();

const port = 8000;
// on line server the port is 80

const expressLayouts = require('express-ejs-layouts');

const db = require('./config/mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJwt = require('./config/passport-jwt-strategy');
const { disable } = require('express/lib/application');

const passportGoogle = require('./config/passport-google-oauth2-strategy');


const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const customMware = require('./config/middleware');

// for sass compiling to css file go to the command prompt and then go to the directory and then do the command 
//  sass --watch assets/scss:assets/css



// app.use(sassMidleware({
//     src:'/assets/scss',
//     dest: '/assets/css',
//     debug: true,
//     outputStyle: 'extended',
//     prefix: '/css'
// }));

app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static('./assets'));

//make the uploads path available to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(expressLayouts);
//extract style and scripts from sub pages into the layout
app.set('layout extraStyles', true);
app.set('layout extractScripts', true);



//set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');


//mongo store is used to store the session cookie in the db
app.use(session({
    name: 'Codial',
    //TODO change the secret before deploymnet in production mode
    secret: 'Blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000*60*100)
    },
    store: new MongoStore(
        {
            mongooseConnection: db,
            autoRemove: 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongoDB setup ok')
        }
    )
}));

// app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);


// use express router
app.use('/', require('./routes'));




app.listen(port, function(err){
    if (err){
        console.log('There is an Error', err);

        // interpolation
        // console.log('Error in running the server: ${err}');

    }

    // console.log('Server is running on port: ${port}');

    console.log('Server is running on port:', port);
});
