'use strict'

const Moo = require("mootools"),
		path = require("path"),
		BaseApp = require ('./base.conf');

var session = require('express-session'),
		MemoryStore = require('memorystore')(session), //https://www.npmjs.com/package/memorystore
		helmet = require('helmet');


/*var session = require('express-session'),
		SQLiteStore = require('connect-sqlite3')(session);*/


module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		logs: { 
			path: './logs' 
		},
		
		authentication: {
			users : [
				{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
				//{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
				/**
				 * *curl -H "Content-Type:application/json" -H "Accept:application/json" -H "Authorization: Basic bGJ1ZW5vOjEyMw==" http://localhost:8081/
				 * */
				{ id: 2, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
				{ id: 3, username: 'test' , role: 'user', password: '123'}
			],
		},
		
	},
	initialize: function(options){
		
		//this.options.middlewares.unshift(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
		this.options.middlewares.unshift(helmet());
		
		
		
		this.options.session = session({
				store: new MemoryStore({
					checkPeriod: 3600000 // prune expired entries every hour
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: '19qX9cZ3yvjsMWRiZqOn',
				resave: true,
				saveUninitialized: false,
				name: 'mngr.api',
				unset: 'destroy'
		});
		
		/*this.options.session = session({
				store: new SQLiteStore ({
					dir: path.join(__dirname,'../devel/var/lib/mngr-api/'),
					db: 'sessions.db'
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: 'keyboard cat',
				resave: true,
				saveUninitialized: true
		});*/
			
		if(process.env.NODE_ENV === 'production'){
			/**
			 * add 'check_authentication' & 'check_authorization' to each route
			 * */
			Object.each(this.options.api.routes, function(routes, verb){
				
				if(verb != 'all'){
					Array.each(routes, function(route){
						//debug('route: ' + verb);
						route.callbacks.unshift('check_authorization');
						route.callbacks.unshift('check_authentication');
						
						if(verb == 'get')//users can "read" info
							route.roles = ['user']
					});
				}
				
			});
		}
		
		this.parent(options);//override default options
		
		
	}
	
});
