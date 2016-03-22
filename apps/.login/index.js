var Moo = require("mootools");

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './package.json')));

exports.VERSION = packageJSON.version.split('.');


module.exports = new Class({
  Implements: [Options, Events],
  
  provides: 'login',
  path: '/login',
  
  server: null,
  
  options: {
  },
  
//   socket: 'connect',
  socket: [
	'info',
  ],
  
  api_routes: {
	post: [
	  {
		path: '',
		callbacks: ['post'],
	  },
	],
	all: [
	  {
		path: '',
		callbacks: ['login']
	  },
	]
  },
  
  routes: {
	post: [
	  {
		path: '',
		callbacks: ['post']
	  },
	],
	all: [
	  {
		path: '',
		callbacks: ['get']
	  },
	]
  },
  
  api_doc: {
	'/': {
	  type: 'function',
	  returns: 'array',
	  description: 'Return an array of registered servers',
	  example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

	}
  },
  render: {
      // Overrides which layout to use, instead of the defaul "main" layout.
  // 		  layout: false
      
      base: "/login",
      title: "Login page",
      scripts: [
	    "/public/js/head.min.js",
	    "/public/apps/login/index.js"
      ],
      css: [
  // 		  "/public/css/bootstrap.css",
  // 		  "/public/css/bootstrap-responsive.css"
	    "/public/bootplus/css/bootplus.min.css",
	    "/public/bootplus/css/bootplus-responsive.min.css",
	    "/public/bootplus/css/font-awesome.min.css"
      ],
  // 		css: [
  // 		  "/public/charisma/css/bootstrap-classic.css",
  // 		  "/public/charisma/css/bootstrap-responsive.css",
  // 		  "/public/charisma/css/charisma-app.css"
  // 		],

  },
		
  login: function(req, res, next){
	console.log('Login Request');
	console.log(req.headers.authorization);
	
	this.server.authenticate(req, res, next,  function(err, user, info) {
	  
	  this.server.profile('login_authenticate');
	  
	  if (err) {
		this.server.log('login', 'error', err);

		return next(err)
	  }
	  if (!user) {
		this.server.log('login', 'warn', 'login authenticate ' + info.message);
		
		res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
		
// 		req.flash('error', info.message);
		res.send({'status': 'error', 'error': info.message});

// 		return res.redirect('/login')
		
// 		res.render(path.join(__dirname, '/views/login'), this.render);
	  }
	  else{
		req.logIn(user, function(err) {
		  if (err) {
			this.server.log('login', 'error', err);
			return next(err);
		  }
		  
		  this.server.log('login', 'info', 'login authenticate ' + util.inspect(user));
		  
		  ////add subjects dinamically
  // 		this.server.authorization.processRules({
  // 		  "subjects":[
  // 			{
  // 			  "id": "lbueno",
  // 			  "roles":["admin"]
  // 			},
  // 			{
  // 			  "id": "test",
  // 			  "roles":["user"]
  // 			},
  // 		  ],
  // 		});
		  res.cookie('bad', false, { maxAge: 0, httpOnly: false });
		  
		  res.send({'status': 'ok'});
		  
		}.bind(this));
	  }
	}.bind(this));
	
	
  },
  info: function(){
	return {brand: 'Login App'};
  },
  
//   connect: function(socket){
// 	  var hs = socket.handshake;
// 	  
// 	  console.log(hs.session);
// 	  
// 	  console.log('Client connected with sessionID on login: ' + hs.sessionID );
// 	  socket.broadcast.emit('message', {'msg': 'Client connected with sessionID on login: ' + hs.sessionID })
// 	  
// 	  socket.on('message', function(message){
//   // 		session.pings = session.pings + 1 || 1;
// 		  console.log('login Message: ' + JSON.stringify(message));
// 		  socket.emit('message', {'msg': 'hello login '})
//   // 		console.log('Session: ' + JSON.stringify(session));
// 	  });
// 	  socket.on('disconnect', function(){
// 		  console.log('Client disconnected.');
// 	  });
//   },
//   
  get: function(req, res, next){
	this.server.profile('login');//start profiling
	
	if (req.isAuthenticated()) {
	  this.server.profile('login');
	  this.server.log('login', 'info', 'login authenticated: ' + util.inspect( req.user ));
	  
// 	  res.redirect('/');
	  res.redirect('back');
	}
	else{
	  this.server.profile('login');
	  this.server.log('login', 'info', 'login not authenticated');
	  
// 	  res.render("login/views/index.html");
	  
	  res.cookie('bad', true, { maxAge: 0, httpOnly: false });
	  
	  res.render(path.join(__dirname, '/views/login'), this.render);
	}
	
// 	if(req.is('json')){
// 	  console.log('request');
// 	  console.log(req.accepts('json'));
// 	  res.send({brand: 'Login App'});
// 	}
// 	else{
// 	  res.render("login/views/index.html");
// 	}
	
  },
  post: function(req, res, next){
	console.log('Login Request');
	console.log(JSON.stringify(req.params));
	
	this.server.profile('login_authenticate');
	
	this.server.authenticate(req, res, next,  function(err, user, info) {
	  
	  this.server.profile('login_authenticate');
	  
	  if (err) {
		this.server.log('login', 'error', err);

		return next(err)
	  }
	  if (!user) {
		this.server.log('login', 'warn', 'login authenticate ' + info.message);
		
		res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
		
		req.flash('error', info.message);

// 		return res.redirect('/login')
		
		res.render(path.join(__dirname, '/views/login'), this.render);
	  }
	  else{
		req.logIn(user, function(err) {
		  if (err) {
			this.server.log('login', 'error', err);
			return next(err);
		  }
		  
		  this.server.log('login', 'info', 'login authenticate ' + util.inspect(user));
		  
		  ////add subjects dinamically
  // 		this.server.authorization.processRules({
  // 		  "subjects":[
  // 			{
  // 			  "id": "lbueno",
  // 			  "roles":["admin"]
  // 			},
  // 			{
  // 			  "id": "test",
  // 			  "roles":["user"]
  // 			},
  // 		  ],
  // 		});
		  res.cookie('bad', false, { maxAge: 0, httpOnly: false });
		  
		  return res.redirect('/');
		  
		}.bind(this));
	  }
	}.bind(this));
	

  },
  initialize: function(server, options){
	
	this.server = server;
	this.setOptions(options);//override default options
	
// 	server.middleware.get('/login/_json', function(req, res, next){
// 	  
// 	  res.send({brand: 'Login App'});
// 	});
// 	
// 	server.socket.sio.of('/socket/login').on('connection', function(socket){
// 		var hs = socket.handshake;
// 		
// 		console.log(hs.session);
// 		
// 		console.log('Client connected with sessionID on login: ' + hs.sessionID );
// 		socket.broadcast.emit('message', {'msg': 'Client connected with sessionID on login: ' + hs.sessionID })
// 		
// 		socket.on('message', function(message){
// 	// 		session.pings = session.pings + 1 || 1;
// 			console.log('login Message: ' + JSON.stringify(message));
// 			socket.emit('message', {'msg': 'hello login '})
// 	// 		console.log('Session: ' + JSON.stringify(session));
// 		});
// 		socket.on('disconnect', function(){
// 			console.log('Client disconnected.');
// 		});
// 	});
	
  },
  
});
