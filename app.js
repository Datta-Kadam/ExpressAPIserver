var fallback = require('express-history-api-fallback');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
const session=require('express-session');
const MongoStore=require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var cors=require('cors');


var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



//DB Set up
mongoose.connect('mongodb://localhost:27017/dualsimulation');
var _db=mongoose.connection;
_db.on('error',console.error.bind(console,'#MongoDB -connection error'));

app.use(function(req, res, next) {
  res.locals.db = _db;
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//-->>> SET UP SESSIONS <<<-----
app.use(session({
  secret:'mySecretString',
  saveUninitialized:false,
  resave:false,
  cookie:{maxAge:1000*60*60*24*2,secure:false,httpOnly:false},
  store:new MongoStore({mongooseConnection: _db, ttl:2*24*60*60})
}));
debugger;
console.log(session);
debugger;

//app.use(express.static(path.join(__dirname, 'public')));
//app.use(fallback('index.html', path.join(__dirname, 'public')))
const root = `${__dirname}/public`
app.use(express.static(root))




//app.use(fallback(__dirname + '/index.html'))

app.use('/',function(req,res,next){
    console.log(req.session);
    next();
});



//SAVE TO SESSIONS
app.post('/client/simulate',function(req,res,next){
  //var cart=req.body;
     const cart= {
          rel:req.body.release,
          projectName:req.body.projectName,
          apiName:req.body.apiName,
          request: req.body.request,
          response:req.body.response,
          userId:req.body.userId
        }  
  console.log('CART ===>>',req.sessionID,req.session);
 //if(req.session && req.session.cart && req.session.cart.userId){
  if(req.body.userId){
    //console.log('userid ==>',req.session.cart.userId)
    req.session.cart=cart;
    req.session.save(function(err){    
      if(err) {
        console.log('Error occured',err);
      }
     // next();
    //res.json(req.session.cart);
    })
  }
  next();
});
//GET CART 
app.get('/cart',function(req,res){
  if(typeof req.session.cart!=='undefined'){
    console.log("SERVER CART SESSION DATA",req.session.cart);
    res.json(req.session.cart);
  }
});
// -->>> END SESSION SET UP <<<<----


app.use('/client', index);
app.use('/users', users);

app.use(fallback('index.html', { root }))
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
