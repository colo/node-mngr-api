'use strict'

var	path = require('path'),
		bodyParser = require('body-parser'),
		multer = require('multer'), // v1.0.5
		upload = multer(), // for parsing multipart/form-data
		cors = require('cors');
	
const App =  process.env.NODE_ENV === 'production'
      ? require('./config/prod.conf')
      : require('./config/dev.conf');
	

	//AdminApp = require(path.join(__dirname,'apps/admin/'));
	
	


var MyApp = new Class({
  Extends: App,
  
  
  get: function(req, res, next){
		console.log(this.authentication.store.users);
		console.log(this.authentication.auth.users);
		
		//console.log('root get');
		//console.log('req.isAuthenticated');
		//console.log(req.isAuthenticated());
		
		//console.log('isAuthorized');
		//console.log(this.isAuthorized({ op: 'view', res: 'abm'}));
		//console.log(this.getSession().getRole().getID());

		
		//if(Object.getLength(req.params) == 0){
			//res.json({ title: 'Root app', content_type: req.get('content-type') });
			
		//}
		//else if(req.params.service_action){
			////res.json({ title: 'Root app', param: req.params, content_type: req.get('content-type') });
		//}
		//else{
			//////console.log({ title: 'Admin app', param: req.params });
			//next();
		//}
		
		res.json({ id: this.options.id });
  },
  
  //post: function(req, res, next){
	  
		//console.log('root post');
		//console.log(req.user);
		//////console.log(req.headers);
		//res.json({ title: 'Root POST' });
		
  //},
  
  initialize: function(options){
		
		this.parent(options);//override default options
		console.log(this.options.api.routes.all);
		
		//this.parent(config.options);//override default options
		
		this.profile('root_init');//start profiling
		
		/*this.authentication.addEvent(this.authentication.ON_AUTH, function(err, user){
			console.log('app.ON_AUTH');
			console.log(err);
			console.log(user);
		});*/
		/*------------------------------------------*/
		if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
			this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
	  
			//   //console.log('event');
			//   //console.log(obj);
			  
			  if(!obj.error){

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
		
		this.express().use(bodyParser.json()); // for parsing application/json
		this.express().use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
		
		this.express().use(cors(this.options.cors));
		
		this.profile('root_init');//end profiling
		
		this.log('root', 'info', 'root started');
		
		this.express().set('authentication',this.authentication);
  },
  
	
});

var root = new MyApp();
root.load(path.join(__dirname, '/apps'));
//var test = new MyApp();
//var admin = new AdminApp();

//root.use('/test', test);
//root.use('/admin', admin);

module.exports = root.express();
