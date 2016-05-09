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
	  
	id: 'logout',
	path: '/logout',
	
	//authorization: {
		////config: path.join(__dirname,'./config/rbac.json'),
	//},
	
	params: {
	},
	
	routes: {
		
		all: [
		  {
			path: '',
			callbacks: ['logout']
		  },
		]
	},
	
	api: {
		
		version: '1.0.0',
		
		routes: {
			all: [
			  {
				path: '',
				callbacks: ['logout'],
				version: '',
			  },
			]
		},
		
	},
  },
  logout: function(req, res, next){
	//console.log('logout');
	
	if (req.isAuthenticated()) {
		//console.log('logout-authenticated');
		
	  this.profile('logout');//start profiling
	  this.log('logout', 'info', 'logout' + util.inspect( req.user ));
	  
	  req.logout();
	  
	  this.profile('logout');//stop profiling
	}
	

	if(req.is('application/json') || req.path.indexOf('/api') == 0){
	  res.send({'status': 'success'});
	}
	else{
	  res.redirect('/');
	}
	
  },
  initialize: function(options){
		
		this.parent(options);//override default options
		
		/*------------------------------------------*/
		/**
		 * *
		if(this.authorization){
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
		}
		* 
		* */
  },
	
});

