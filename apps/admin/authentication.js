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
		path: '/admin/authentication',
		
		params: {
			//id: /^(0|[1-9][0-9]*)$/,
			//username:
			//role:
			//password:
		},
		
		routes: {
			
			//all: [
				//{
				//path: '',
				//callbacks: ['get']
				//},
			//]
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				post: [
					{
					//path: ':user',
					path: '',
					//callbacks: ['check_authentication', 'add'],
					callbacks: ['add'],
					version: '',
					},
				],
				put: [
					{
					path: ':user',
					//callbacks: ['check_authentication', 'add'],
					callbacks: ['update'],
					version: '',
					},
				],
				get: [
					{
					path: ':user',
					callbacks: ['get'],
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
  //find: function(user){
		//user = this.express().get('authentication').store.findByID(user);
			
		//if(!user){
			//user = this.express().get('authentication').store.findByUserName(user);
		//}
		
		//return user;
	//},
  add: function(req, res, next){
		console.log(req.params);
		
		Object.each(req.body, function(value, key){
			console.log(key);
			console.log(value);
		}.bind(this));
		
		res.json({});
	
  },
  update: function(req, res, next){
		console.log(req.params);
		console.log(req.body);
		
		var user = null;
		
		if(req.params.user){
			user = this.express().get('authentication').store.findByID(req.params.user);
			
			if(!user){
				user = this.express().get('authentication').store.findByUserName(req.params.user);
				
				user = Object.merge(user, req.body);
				this.express().get('authentication').store.updateByUserName(user);
				
			}
			else{
				user = Object.merge(user, req.body);
				this.express().get('authentication').store.updateByID(user);
			}
			
			res.json(user);
		}
		else{
			res.json({});
		}
		
  },
  get: function(req, res, next){
		console.log(req.params);
		
		var user = null;
		
		if(req.params.user){
			user = this.express().get('authentication').store.findByID(req.params.user);
			
			if(!user){
				user = this.express().get('authentication').store.findByUserName(req.params.user);
			}
			
			res.json(user);
		}
		else{
			
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
			
		}
  },
  initialize: function(options){
		this.profile('authentication_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('authentication_init');//end profiling
		
		this.log('authentication', 'info', 'authentication started');
  },
  
});
