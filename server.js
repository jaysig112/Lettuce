// server.js
'use strict';
//Load environment variables
require('dotenv').load();

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var passport 	   = require('passport');
require('./config/passport')(passport);
// configuration ===========================================
console.log(__dirname);
var config = require(__dirname + '/config/config');

// set our port
var port = process.env.PORT || 8080; 
// connect to our mongoDB database 
mongoose.connect(config.db.url, {authMechanism: 'ScramSHA1'}); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 
// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 
//Uses the passport package in our application
app.use(passport.initialize());



// Set up Services

//CronJob to update our database with info from rito
var riot = require(__dirname + '/app/services/riot.js');
riot.init(config.riot.updateInterval);




// routes ==================================================
// List of api service modules and the route to mount them on
var apiServices = [
    { route: '/riot', service: require(__dirname + '/app/api/riot') },
    { route: '/team', service: require(__dirname + '/app/api/team') },
    { route: '/auth', service: require(__dirname + '/app/api/auth') },
    { route: '/champ-mastery', service: require(__dirname + '/app/api/champMastery') },
    { route: '/summoner', service: require(__dirname + '/app/api/summoner') },
    { route: '/comp', service: require(__dirname + '/app/api/comp') }
];

//For each sub-api:
apiServices.forEach(function(api){
    var router = express.Router();      //Create a new Router object
    api.service.init(router);           //Initialize the endpoints
    app.use('/api' + api.route, router); //Mount sub-api
});


//Default route that sends our angular application
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load our public/index.html file
});




// start app ===============================================
// startup our app at http://localhost:8080
var server = app.listen(port);               
//Setup Socket
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
    require(__dirname + '/app/sockets/filter-socket')(socket, io);
    require(__dirname + '/app/sockets/lane-socket')(socket, io);
});

// shoutout to the user                     
console.log('Server running on port ' + port);
