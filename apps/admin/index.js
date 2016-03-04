'use strict'

var Moo = require("mootools");

var express = require('express');
	//express_params = require('express-params');

var path = require('path');
//var router = express.Router();


//var app = express();
//app.set('views', path.join(__dirname, 'views'));



module.exports = new Class({
  Implements: [Options, Events],
  
  id: 'admin',
  path: '/admin',
  
  app: null,
  
  //server: null,
  
  options: {
  },
  
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
		callbacks: ['get']
	  },
	]
  },
  
  routes: {
    get: [
		{
			path: '/:service_action',
			callbacks: ['get']
		},
    ],
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
  
  params: {
	  service_action: /start|stop/,
  },
  
  api_doc: {
	'/': {
	  type: 'function',
	  returns: 'array',
	  description: 'Return an array of registered servers',
	  example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

	}
  },
		
  info: function(){
	return {brand: 'Login App'};
  },
  
  get: function(req, res, next){
		console.log('admin get');
		//console.log(Object.getLength(req.params));
		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Admin app' });
		}
		else if(req.params.service_action){
			res.json({ title: 'Admin app', param: req.params });
		}
		else{
			console.log({ title: 'Admin app', param: req.params });
			next();
		}
		
		//next();
		},
		post: function(req, res, next){
		console.log('admin post');
		},
	initialize: function(options){

		this.setOptions(options);//override default options
		var app = express();
		this.app = app;
		
		
		console.log('admin.params:');
		//console.log(Object.clone(this.params));
		
		this.sanitize_params();
		this.apply_routes();
		this.apply_api_routes();
		
	
  },
  /**
	* @params
	* 
	* */
  sanitize_params: function(){
		 
		var params = Object.clone(this.params);
		
		console.log(params);
		
		if(params){
			var app = this.app;
			
			Object.each(params, function(condition, param){
				console.log('param: '+param);
				console.log('condition: '+condition);
				
				app.param(param, function(req, res, next, str){
					console.log('app.param: '+param);
					console.log(condition.exec(str));
					
					if(condition.exec(str) == null)
						req.params[param] = null;
						
					next();
				});
			});
		}
  }.protect(),
  apply_api_routes: function(){
	
		if(this.api_routes){
			var app = this.app;
			console.log('routes');
			console.log(this.routes);
				
			Object.each(this.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
				console.log('verb routes: '+verb);
				console.log(routes);
				
				routes.each(function(route){//each array is a route
					
					//var path = app.path + route.path;

					var callbacks = [];
					route.callbacks.each(function(fn){
						console.log('api function:' + fn);
						callbacks.push(this[fn].bind(this));
					}.bind(this));
					
					app[verb]('/api/'+route.path, callbacks);

				}.bind(this));

			}.bind(this));
		}
  }.protect(),
  apply_routes: function(){
	
		if(this.routes){
			var app = this.app;
			console.log('routes');
			console.log(this.routes);
				
			Object.each(this.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
				console.log('verb routes: '+verb);
				console.log(routes);
				
				routes.each(function(route){//each array is a route
					
					//var path = app.path + route.path;

					var callbacks = [];
					route.callbacks.each(function(fn){
						callbacks.push(this[fn].bind(this));
					}.bind(this));
					
					app[verb](route.path, callbacks);

				}.bind(this));

			}.bind(this));
		}
  }.protect(),
  express: function(){
	  return this.app;
  }
});

//app.use('/', router);

//module.exports = app;
//module.exports.routes = routes;
