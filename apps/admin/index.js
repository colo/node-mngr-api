'use strict'

var Moo = require("mootools"),
	path = require('path'),
	express = require('express'),
	semver = require('semver'),
	bodyParser = require('body-parser'),//json parse
	session = require('express-session');//for passport session
	

var fs = require('fs'),
	util = require('util');	

var Logger = require('node-express-logger'),
	Authorization = require('node-express-authorization'),
	Authentication = require('node-express-authentication');
//var router = express.Router();


//var app = express();
//app.set('views', path.join(__dirname, 'views'));



module.exports = new Class({
  Implements: [Options, Events],
  
  id: 'admin',
  path: '/admin',
  
  app: null,
  logger: null,
  authorization:null,
  
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
		callbacks: ['check_authentication', 'post']
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
			version: '2.0.0',
			},
			{
			path: ':service_action',
			callbacks: ['get_api'],
			content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
			version: '1.0.1',
			},
		],
		post: [
		  {
			path: '',
			callbacks: ['check_authentication', 'post'],
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
	
	/*doc: {
		'/': {
		  type: 'function',
		  returns: 'array',
		  description: 'Return an array of registered servers',
		  example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

		}
	},*/
  },
  
  
		
  info: function(){
	return {brand: 'Login App'};
  },
  
  get_api: function(req, res, next){
		////console.log('admin get_api');
		////console.log(Object.getLength(req.params));
		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Admin API', version: req.version, content_type: req.get('content-type') });
		}
		else if(req.params.service_action){
			res.json({ title: 'Admin API', param: req.params, version: req.version, content_type: req.get('content-type') });
		}
		else{
			//console.log({ title: 'Admin API', param: req.params });
			next();
		}
		
		//next();
  },
  get_no_version_available: function(req, res, next){
		//console.log('admin get_no_version_available');
		////console.log(Object.getLength(req.params));
		
		res.status(404).json({ message: 'No API version available' });
		
  },
  //post: function(req, res, next){
		////console.log('admin post');
  //},
  
  get: function(req, res, next){
		console.log('admin get');
		console.log('req.isAuthenticated');
		console.log(req.isAuthenticated());
		
		////console.log(Object.getLength(req.params));
		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Admin app', content_type: req.get('content-type') });
		}
		else if(req.params.service_action){
			res.json({ title: 'Admin app', param: req.params, content_type: req.get('content-type') });
		}
		else{
			//console.log({ title: 'Admin app', param: req.params });
			next();
		}
		
		//next();
  },
  
  post: function(req, res, next){
	  
		console.log('admin post');
		//console.log(req.headers);
		res.json({ title: 'Admin app POST' });
		
		//console.log(req);
		
		//this.authenticate(req, res, next,  function(err, user, info) {
	  
		  //if (err) {
				//this.log('login', 'error', err);
				//return next(err)
		  //}
		  
		  //if (!user) {
				//this.log('login', 'warn', 'login authenticate ' + info.message);
				
				//res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
				
				//req.flash('error', info.message);

		//// 		return res.redirect('/login')
				
				////res.render(path.join(__dirname, '/views/login'), this.render);
				//res.json({ title: 'Admin app POST', info: info });
		  //}
		  //else{
				//req.logIn(user, function(err) {
					//if (err) {
					//this.log('login', 'error', err);
					//return next(err);
					//}
					
					//this.log('login', 'info', 'login authenticate ' + util.inspect(user));
					
					//res.cookie('bad', false, { maxAge: 0, httpOnly: false });
					
					////return res.redirect('/');
					//return res.json({'login': 'ok'});
					
				//}.bind(this));
		  //}
		//}.bind(this));
		
		
  },
  
  initialize: function(options){
		//throw {err: 'implement accept for content negotiation'};
		
		this.setOptions(options);//override default options
		var app = express();
		this.app = app;
		
		app.use(bodyParser.urlencoded({ extended: false }))
		// parse application/json
		app.use(bodyParser.json())


		//logger
		this.logger = new Logger(this, { "path": './logs' });
		app.use(this.logger.access());
		
		//authentication
		var SessionMemoryStore = require('express-session/session/memory');//for socket.io / sessions
		app.use(
			session(
				{
					//store: new SessionMemoryStore,
					//proxy: true,
					//cookie: { path: '/', httpOnly: true, maxAge: null },
					cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
					secret: 'keyboard cat',
					resave: true,
					saveUninitialized: true
				}
			)
		);
		
		var MemoryStore = require('node-authentication').MemoryStore;
		
		//----Mockups libs
		var UsersAuth = require(path.join(__dirname, 'libs/mockups/authentication/type/users'));
		var users = [
		  { id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
		  { id: 2, username: 'test' , role: 'user', password: '123'}
		];

		/*
		 var MemcachedStore = require('connect-memcached')(require('express-session'));
		 new MemcachedStore({
			hosts: ['127.0.0.1:11211']
		})
		*/
		
		var authentication = new Authentication(this, {
								store: new MemoryStore(users),
								auth: new UsersAuth({users: users}),
								passport: {session: true}
						  });
		
		this.authentication = authentication;
		//-------------------------------------
		
		//authorization
		var authorization = new Authorization(this, 
			JSON.decode(
				fs.readFileSync(path.join(__dirname, 'config/rbac.json' ), 'ascii')
			)
		);
		// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
		// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
		// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
		this.authorization = authorization;
		app.use(this.authorization.session());
		//-------------------------------------
		
		this.profile('app_init');//start profiling
		
		if(this.api.versioned_path !== true)
			this.api.force_versioned_path = false;
			
		//console.log('admin.params:');
		////console.log(Object.clone(this.params));
		
		this.sanitize_params();
		
		this.apply_routes();
		
		this.apply_api_routes();
		
		
		this.profile('app_init');//end profiling
		
		this.log('admin', 'info', 'app started');
		
		/*------------------------------------------*/
		this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
  
		//   console.log('event');
		//   console.log(obj);
		  
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
  },
  /**
	* @params
	* 
	* */
  sanitize_params: function(){
		 
		var params = Object.clone(this.params);
		
		//console.log(params);
		
		if(params){
			var app = this.app;
			
			Object.each(params, function(condition, param){
				//console.log('param: '+param);
				//console.log('condition: '+condition);
				
				app.param(param, function(req, res, next, str){
					//console.log('app.param: '+param);
					//console.log(condition.exec(str));
					
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
		//console.log('API routes');
		//console.log(api.routes);
		
		Object.each(api.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
			//console.log('verb routes: '+verb);
			//console.log(routes);
			
			var content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
			var version = (typeof(api.version) !== "undefined") ? api.version : '';
			
			//console.log('routes content-type: '+content_type);
			//console.log('routes version: '+version);
			
			routes.each(function(route){//each array is a route
				
				content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
				version = (typeof(route.version) !== "undefined") ? route.version : version;
				
				//console.log('specific route content-type: '+content_type);	
				//console.log('specific route version: '+version);
				
				var path = '';
				path += (typeof(api.path) !== "undefined") ? api.path : '';
				
				var versioned_path = '';
				
				if(api.versioned_path === true && version != ''){
					//path += (typeof(api.version) !== "undefined") ? '/' + api.version : '';
					//console.log('version:'+version);
					versioned_path = path + '/v'+semver.major(version);
					versioned_path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
				}
				
				path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
				
				//console.log('PATH: '+path);
				
				var callbacks = [];
				route.callbacks.each(function(fn){
					//console.log('api function:' + fn);
					//console.log('api function:' + this[fn]);
					
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
				
				//console.log('api route:'+path);
				
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
	  //~ //console.log('arguments');
	  //~ //console.log(arguments);
	  
	  //console.log('API check content-type: '+ req.headers['content-type'] +' | ' + content_type.test(req.headers['content-type']));
	  
	  if(content_type.test(req.headers['content-type'])){
		callback(req, res, next);
	  }
	  else{
		next();
	  }
  },*/
  
  check_content_type: function(callback, content_type, req, res, next){
	  //console.log('arguments');
	  //console.log(req.headers);
	  //console.log(content_type);
	  
	  //console.log('check content-type: '+ req.headers['content-type'] +' | ' +content_type.test(req.headers['content-type']));
	  
	  if(this.api.force_versioned_path ||//if apt-version path is forced, no checks needed
			content_type.test(req.get('content-type')) || //check if content-type match
			!req.get('content-type')){//or if no content-type it specified
			callback(req, res, next);
	  }
	  else{
			next();
	  }
  },
  check_accept_version: function(callback, version, req, res, next){
	  //console.log('version arg');
	  //console.log(version);
	  
	  //console.log('check api-version: '+ req.headers[this.api.accept_header] +' | ' +semver.satisfies(version, req.headers[this.api.accept_header]));
	  
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
		//console.log('routes');
		//console.log(this.routes);
		//~ //console.log('routes content-type: '+content_type);	
		
		Object.each(this.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
			//console.log('verb routes: '+verb);
			//console.log(routes);
			
			var content_type = (typeof(this.routes.content_type) !== "undefined") ? this.routes.content_type : '';
			//console.log('routes content-type: '+content_type);
			
			routes.each(function(route){//each array is a route
				
				//var path = app.path + route.path;
				content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
			
				//console.log('specific route content-type: '+content_type);	
			
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
  },
  //required for 'check_authentication', should be 'implement' injected on another module, auto-loaded by authentication?
  403: function(req, res, next, err){
		
		res.status(403);
		
		res.format({
			'text/plain': function(){
				res.send(err);
			},

			'text/html': function(){
				res.send(err);
			},

			'application/json': function(){
				res.send(err);
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable '+ err);
			}
		});
	},
	//required for 'check_authentication', should be 'implement' injected on another module, auto-loaded by authentication?
	500: function(req, res, next, err){
		
		res.status(500);
		
		res.format({
			'text/plain': function(){
				res.send(err);
			},

			'text/html': function(){
				res.send(err);
			},

			'application/json': function(){
				res.send(err);
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable '+ err);
			}
		});
	},
	
});

//app.use('/', router);

//module.exports = app;
//module.exports.routes = routes;
