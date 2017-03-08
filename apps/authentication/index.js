'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  //authorization:null,
  //authentication: null,
  
  options: {
	  
		id: 'authentication',
		path: '/authentication',
		
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
				/*post: [
					{
					path: '',
					callbacks: ['authentication'],
					version: '',
					},
				],*/
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
  
  /*authentication: function(req, res, next){
		//console.log('Login Request');
		//console.log(req.headers.authorization);
		
		this.authenticate(req, res, next,  function(err, user, info) {
			
			this.profile('authentication_authenticate');
			
			if (err) {
			this.log('authentication', 'error', err);

			return next(err)
			}
			if (!user) {
			//console.log('info: '+info);
			this.log('authentication', 'warn', 'authentication authenticate ' + info);
			
			res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
			
			//req.flash('error', info);
			res.send({'status': 'error', 'error': info});

			}
			else{
			req.logIn(user, function(err) {
				if (err) {
				this.log('authentication', 'error', err);
				return next(err);
				}
				
				this.log('authentication', 'info', 'authentication authenticate ' + util.inspect(user));
				
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
	
	
  },*/
  get: function(req, res, next){
		
		console.log('this.authentication');
		console.log(this.express().get('authentication').options.store.options.users);
		
		this.express().get('authentication').options.store.options.users.push(
			{ id: 3, username: 'colo' , role: 'user', password: '456'}
		);
		
		console.log(this.express().get('authentication').options.store.options.users);
		
		console.log('-------------------------------------------------------');
		
		console.log(this.express().get('authentication').options.auth.options.users);
		
		this.express().get('authentication').options.auth.options.users.push(
			{ id: 3, username: 'colo' , role: 'user', password: '456'}
		);
		
		console.log(this.express().get('authentication').options.auth.options.users);
		
		res.status(200);
			
		res.format({
			'text/plain': function(){
				res.send('authentication app');
			},

			'text/html': function(){
				res.send('<h1>authentication app</h1');
			},

			'application/json': function(){
				res.send({info: 'authentication app'});
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable');
			}
		});
	
  },
  initialize: function(options){
		this.profile('authentication_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('authentication_init');//end profiling
		
		this.log('authentication', 'info', 'authentication started');
  },
  
});
