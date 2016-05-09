'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
	id: 'login',
	path: '/login',
	
	params: {
	},
	
	routes: {
		
		all: [
		  {
			path: '',
			callbacks: ['get']
		  },
		]
	},
	
	api: {
		
		version: '1.0.0',
		
		routes: {
			post: [
			  {
				path: '',
				callbacks: ['login'],
				version: '',
			  },
			],
			all: [
			  {
				path: '',
				callbacks: ['get'],
				version: '',
			  },
			]
		},
		
	},
  },
  login: function(req, res, next){
	//console.log('Login Request');
	//console.log(req.headers.authorization);
	
	this.authenticate(req, res, next,  function(err, user, info) {
	  
	  this.profile('login_authenticate');
	  
	  if (err) {
		this.log('login', 'error', err);

		return next(err)
	  }
	  if (!user) {
		//console.log('info: '+info);
		this.log('login', 'warn', 'login authenticate ' + info);
		
		res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
		
 		//req.flash('error', info);
		res.send({'status': 'error', 'error': info});

	  }
	  else{
		req.logIn(user, function(err) {
		  if (err) {
			this.log('login', 'error', err);
			return next(err);
		  }
		  
		  this.log('login', 'info', 'login authenticate ' + util.inspect(user));
		  
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
  get: function(req, res, next){
	res.status(200);
		
	res.format({
		'text/plain': function(){
			res.send('login app');
		},

		'text/html': function(){
			res.send('<h1>login app</h1');
		},

		'application/json': function(){
			res.send({info: 'login app'});
		},

		'default': function() {
			// log the request and respond with 406
			res.status(406).send('Not Acceptable');
		}
	});
	
  },
  initialize: function(options){
		this.profile('login_init');//start profiling
		
		this.parent(options);//override default options
		
		/*------------------------------------------*/
		/**if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
			this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
	  
			//   //console.log('event');
			//   //console.log(obj);
			  
			  if(!obj.error){
				
			// 	web.authorization.processRules({
			// 	  "subjects":[
			// 		{
			// 		  "id": "lbueno",
			// 		  "roles":["admin"]
			// 		},
			// 		{
			// 		  "id": "test",
			// 		  "roles":["user"]
			// 		},
			// 	  ],
			// 	});

				this.authorization.processRules({
				  "subjects": function(){
					  if(obj.getID() == "test")
						return [{ "id": "test", "roles":["user"]}];
					  
					  if(obj.getID() == "lbueno")
						return [{ "id": "lbueno", "roles":["admin"]}];
				  },
				});
			  }
			  
			}.bind(this));
		}**/
		
		this.profile('login_init');//end profiling
		
		this.log('login', 'info', 'login started');
  },
  
});
