/* basic initializations */
var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  hbs = require('express-handlebars')
  socketIo = require(path.join(__dirname, '/libs/Game'));


/* main port */
var port = 8080;


/* routes */
var users = require(path.join(__dirname, '/routes/users'));
var moderator = require(path.join(__dirname, '/routes/moderator'));

/* main execution */
var app = express();


/* view engine config using handle bars */
app.engine('hbs', hbs({extname:'hbs', defaultLayout:'layout', layoutsDir: __dirname + '/views/layout/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

 
/* public directories */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* main routings */
app.use('/users', users);
app.use('/moderator', moderator);


var server = app.listen(process.env.PORT || port);

/* server socket initialization */
var startIo = new socketIo(server);
startIo.startGameEngine(); // let's go


/* catch 404 and forward to error handler */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* error handler */
app.use(function(err, req, res, next) {

  /* set locals, only providing error in development */
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  /* render the error page */
  res.status(err.status || 500);
  res.render('error');
});


/* var server = app.listen(port); */