'use strict'

var App = require('node-express-app'),
	path = require('path'),
	fs = require('fs'),
	AdminApp = require(path.join(__dirname,'apps/admin/'));
	
	


var MyApp = new Class({
  Extends: App,
  
  ON_LOAD_APP: 'onLoadApp',
  ON_USE: 'onUse',
  ON_USE_APP: 'onUseApp',
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
	id: 'root',
	path: '/',
	
	logs: { 
		path: './logs' 
	},
	
	authentication: {
		users : [
			  //{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
			  { id: 1, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
			  { id: 2, username: 'test' , role: 'user', password: '123'}
		],
	},
	
	authorization: {
		config: path.join(__dirname,'./config/rbac.json'),
	},
	
	routes: {
		
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
	
	api: {
		
		version: '1.0.0',
		
		routes: {
			post: [
			  {
				path: '',
				callbacks: ['check_authentication', 'post'],
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
  
  get: function(req, res, next){
		console.log('root get');
		console.log('req.isAuthenticated');
		console.log(req.isAuthenticated());
		
		console.log('isAuthorized');
		console.log(this.isAuthorized({ op: 'view', res: 'abm'}));
		console.log(this.getSession().getRole().getID());

		
		if(Object.getLength(req.params) == 0){
			res.json({ title: 'Root app', content_type: req.get('content-type') });
		}
		else if(req.params.service_action){
			res.json({ title: 'Root app', param: req.params, content_type: req.get('content-type') });
		}
		else{
			//console.log({ title: 'Admin app', param: req.params });
			next();
		}
		
  },
  
  post: function(req, res, next){
	  
		console.log('root post');
		//console.log(req.headers);
		res.json({ title: 'Root POST' });
		
  },
  
  initialize: function(options){
		
		this.parent(options);//override default options
		
		this.profile('root_init');//start profiling
		
		/*------------------------------------------*/
		if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
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
		}
		
		this.profile('root_init');//end profiling
		
		this.log('root', 'info', 'root started');
  },
  use: function(mount, app){
	console.log('app');
	console.log(typeOf(app));
	
	this.fireEvent(this.ON_USE, [app, this]);
	
	if(typeOf(app) == 'class' || typeOf(app) == 'object')
		this.fireEvent(this.ON_USE_APP, [app, this]);
	
	if(typeOf(app) == 'class')
		app = new app();
		
	if(typeOf(app) == 'object'){
		this.app.use(mount, app.express());
	}
	else{
		this.app.use(mount, app);
	}
  },
  load: function(wrk_dir, options){
		options = options || {};
		
		//console.log('load.options');
		//console.log(options);
		
		fs.readdirSync(wrk_dir).forEach(function(file) {

			var full_path = path.join(wrk_dir, file);
			
			
			if(! (file.charAt(0) == '.')){//ommit 'hiden' files
				//console.log('-------');
				
				//console.log('app load: '+ file);
				var app = null;
				var id = '';//app id
				var mount = '';
				
				if(fs.statSync(full_path).isDirectory() == true){//apps inside dir
					
					//console.log('dir app: '+full_path);
					
					var dir = file;//is dir
					
					fs.readdirSync(full_path).forEach(function(file) {//read each file in directory
						
						if(path.extname(file) == '.js' && ! (file.charAt(0) == '.')){
							
							//console.log('app load js: '+ file);
							app = require(path.join(full_path, file));
							
							if(file == 'index.js'){
								mount = id = dir;
							}
							else{
								id = dir+'.'+path.basename(file, '.js');
								mount = dir+'/'+path.basename(file, '.js');
							}
							
							if(typeOf(app) == 'class'){//mootools class
								//console.log('class app');
								
								this.fireEvent(this.ON_LOAD_APP, [app, this]);
								
								app = new app(options);
								
								/*//console.log('mootols_app.params:');
								//console.log(Object.clone(instance.params));*/
								
								//app = instance.express();
								//id = (instance.id) ? instance.id : id;
								//apps[app.locals.id || id]['app'] = app;
							}
							else{//nodejs module
								//console.log('express app...nothing to do');
							}
							
							mount = '/'+mount;
							
							this.use(mount, app);
							//apps[app.locals.id || id] = {};
							//apps[app.locals.id || id]['app'] = app;
							//apps[app.locals.id || id]['mount'] = mount;
						}

					}.bind(this));//end load single JS files

				}
				else if(path.extname( file ) == '.js'){// single js apps
					//console.log('file app: '+full_path);
					//console.log('basename: '+path.basename(file, '.js'));
					
					app = require(full_path);
					id = path.basename(file, '.js');
					
					if(file == 'index.js'){
						mount = '/';
					}
					else{
						mount = '/'+id;
					}
					
					if(typeOf(app) == 'class'){//mootools class
						
						this.fireEvent(this.ON_LOAD_APP, [app, this]);
						
						app = new app(options);
						//app = instance.express();
						//id = (instance.id) ? instance.id : id;
					}
					else{//nodejs module
						//console.log('express app...nothing to do');
					}
					
					this.use(mount, app);
					//apps[app.locals.id || id] = {};
					//apps[app.locals.id || id]['app'] = app;
					//apps[app.locals.id || id]['mount'] = mount;
				}
				
				
			}
		}.bind(this))
		
		//return apps;
	}
	
});

var root = new MyApp();
root.load(path.join(__dirname, '/apps'));
//var test = new MyApp();
//var admin = new AdminApp();

//root.use('/test', test);
//root.use('/admin', admin);

module.exports = root.express();
