'use strict'

var Moo = require("mootools");

var express = require('express'),
	semver = require('semver');
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
  
  routes: {
    /**
     * @content_type regex to restric allowed req.headers['content-type'], if undefined or '', allow all
     * can be nested inside each route
     * http://stackoverflow.com/questions/23190659/expressjs-limit-acceptable-content-types
	* */
    content_type: /text\/plain/,
	
    get: [
		{
			path: '/:service_action',
			callbacks: ['get'],
			content_type: /text\/plain/,
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
  
  api: {
	
	/**
     * @content_type regex to restric allowed req.headers['content-type'], if undefined or '', allow all
     * can be nested inside each route
     * http://stackoverflow.com/questions/23190659/expressjs-limit-acceptable-content-types
	* */
	content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
	
	//path: '/api',
	
	version: '1.0.0',
	
	//versioned_path: true, //default false
	
	force_versioned_path: true, //default true, if false & version_path true, there would be 2 routes, filter with content-type
	
	accept_header: 'accept-version',
	
	routes: {
		get: [
			/*{
			path: '',
			callbacks: ['get_api'],
			content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
			//version: '1.0.1',
			},*/
			{
			path: ':service_action',
			callbacks: ['get_api'],
			content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
			version: '1.0.1',
			},
			{
			path: ':service_action',
			callbacks: ['get_api'],
			content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
			version: '2.0.0',
			},
		],
		post: [
		  {
			path: '',
			callbacks: ['post'],
		  },
		],
		all: [
		  {
			path: '*',
			callbacks: ['get_no_version_available'],
			version: '',
		  },
		]
	},
	
	doc: {
		'/': {
		  type: 'function',
		  returns: 'array',
		  description: 'Return an array of registered servers',
		  example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

		}
	},
  },
  
  
		
  info: function(){
	return {brand: 'Login App'};
  },
  
  get_api: function(req, res, next){
		console.log('admin get_api');
		//console.log(Object.getLength(req.params));
		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Admin API', version: req.version, content_type: req.get('content-type') });
		}
		else if(req.params.service_action){
			res.json({ title: 'Admin API', param: req.params, version: req.version, content_type: req.get('content-type') });
		}
		else{
			console.log({ title: 'Admin API', param: req.params });
			next();
		}
		
		//next();
  },
  get_no_version_available: function(req, res, next){
		console.log('admin get_no_version_available');
		//console.log(Object.getLength(req.params));
		
		res.status(404).json({ message: 'No API version available' });
		
  },
  post: function(req, res, next){
		console.log('admin post');
  },
  
  get: function(req, res, next){
		console.log('admin get');
		//console.log(Object.getLength(req.params));
		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Admin app', content_type: req.get('content-type') });
		}
		else if(req.params.service_action){
			res.json({ title: 'Admin app', param: req.params, content_type: req.get('content-type') });
		}
		else{
			console.log({ title: 'Admin app', param: req.params });
			next();
		}
		
		next();
  },
  
  post: function(req, res, next){
		console.log('admin post');
		res.json({ title: 'Admin app POST', content_type: req.get('content-type') });
  },
  
  initialize: function(options){

		this.setOptions(options);//override default options
		var app = express();
		this.app = app;
		
		if(this.api.versioned_path !== true)
			this.api.force_versioned_path = false;
			
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
	var api = this.api;
	
	//~ var content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
	
	if(api.routes){
		var app = this.app;
		console.log('API routes');
		console.log(api.routes);
		
		Object.each(api.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
			console.log('verb routes: '+verb);
			console.log(routes);
			
			var content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
			var version = (typeof(api.version) !== "undefined") ? api.version : '';
			
			console.log('routes content-type: '+content_type);
			console.log('routes version: '+version);
			
			routes.each(function(route){//each array is a route
				
				content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
				version = (typeof(route.version) !== "undefined") ? route.version : version;
				
				console.log('specific route content-type: '+content_type);	
				console.log('specific route version: '+version);
				
				var path = '';
				path += (typeof(api.path) !== "undefined") ? api.path : '';
				
				var versioned_path = '';
				
				if(api.versioned_path === true && version != ''){
					//path += (typeof(api.version) !== "undefined") ? '/' + api.version : '';
					console.log('version:'+version);
					versioned_path = path + '/v'+semver.major(version);
					versioned_path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
				}
				
				path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
				
				console.log('PATH: '+path);
				
				var callbacks = [];
				route.callbacks.each(function(fn){
					console.log('api function:' + fn);
					
					//if(content_type != ''){
						//~ callbacks.push(this.check_content_type_api.bind(this));
						callbacks.push(
							this.check_content_type.bind(this, 
								this.check_accept_version.bind(this, 
									this[fn].bind(this),
									version),
							content_type)
						);
					//}
					//else{
						//callbacks.push(this[fn].bind(this));
					//}
					
					
				}.bind(this));
				
				console.log('api route:'+path);
				
				if(api.force_versioned_path){//route only work on api-version path
					app[verb](versioned_path, callbacks);
				}
				else{//route works on defined path
					if(api.versioned_path === true && version != ''){//route also works on api-version path
						app[verb](versioned_path, callbacks);
					}
					app[verb](path, callbacks);
				}

			}.bind(this));

		}.bind(this));
	}
  }.protect(),
  
  /*check_content_type_api: function(callback, content_type, req, res, next){
	  //~ console.log('arguments');
	  //~ console.log(arguments);
	  
	  console.log('API check content-type: '+ req.headers['content-type'] +' | ' + content_type.test(req.headers['content-type']));
	  
	  if(content_type.test(req.headers['content-type'])){
		callback(req, res, next);
	  }
	  else{
		next();
	  }
  },*/
  
  check_content_type: function(callback, content_type, req, res, next){
	  console.log('arguments');
	  console.log(req.headers);
	  console.log(content_type);
	  
	  console.log('check content-type: '+ req.headers['content-type'] +' | ' +content_type.test(req.headers['content-type']));
	  
	  if(this.api.force_versioned_path ||//if apt-version path is forced, no checks needed
			content_type.test(req.headers['content-type']) || //check if content-type match
			!req.headers['content-type']){//or if no content-type it specified
			callback(req, res, next);
	  }
	  else{
			next();
	  }
  },
  check_accept_version: function(callback, version, req, res, next){
	  console.log('version arg');
	  console.log(version);
	  
	  console.log('check api-version: '+ req.headers[this.api.accept_header] +' | ' +semver.satisfies(version, req.headers[this.api.accept_header]));
	  
	  var accept_header = (this.api.accept_header) ? this.api.accept_header : 'accept-version';
	  
	  //if(version.test(req.headers['accept-version']) || !version){
	  if(!version ||
		!req.headers[accept_header] ||
		semver.satisfies(version, req.headers[accept_header])){
		
		req.version = version;	
			callback(req, res, next);
	  }
	  else{
			next();
	  }
  },
  apply_routes: function(){
	  
	//~ var content_type = (typeof(this.routes.content_type) !== "undefined") ? this.routes.content_type : '';
	
	if(this.routes){
		var app = this.app;
		console.log('routes');
		console.log(this.routes);
		//~ console.log('routes content-type: '+content_type);	
		
		Object.each(this.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
			console.log('verb routes: '+verb);
			console.log(routes);
			
			var content_type = (typeof(this.routes.content_type) !== "undefined") ? this.routes.content_type : '';
			console.log('routes content-type: '+content_type);
			
			routes.each(function(route){//each array is a route
				
				//var path = app.path + route.path;
				content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
			
				console.log('specific route content-type: '+content_type);	
			
				var callbacks = [];
				route.callbacks.each(function(fn){
					
					
					if(content_type != ''){
						callbacks.push(this.check_content_type.bind(this, this[fn].bind(this), content_type));
					}
					else{
						callbacks.push(this[fn].bind(this));
					}
					
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
