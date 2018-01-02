'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

//var winston = require('winston');
const limit = require('node-limit/rate/request');
var req_limit = new limit({
									limit: 5,
									interval: 1000
								});

var req_max = new limit({
									limit: 2,
									interval: 5000
								});
								
module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		//middlewares: [req_limit.ip(), req_limit.user()],
		//middlewares: [req_limit.ip(), req_max.ip()],
		//middlewares: [req_limit.user()],
		
		authentication: {
			users : [
					{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
					{ id: 2, username: 'test' , role: 'user', password: '123'}
			],
		},
		
		logs: {
			loggers: {
				error: null,
				access: null,
				profiling: null
			},
			
			path: './logs',
			
			//default: [
				//{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				//{ transport: winston.transports.File, options: {level: 'info', filename: null } }
			//]
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				get: [
					{
						path: '',
						callbacks: ['check_authentication', req_limit.user(), req_max.ip(), 'get'],
						version: '',
					},
				],
				all: [
					{
						path: '',
						callbacks: ['404'],
						version: '',
					},
				]
			},
		}
	},
	initialize: function(options){
		
		//this.addEvent(this.ON_INIT_AUTHENTICATION, function(authentication){
			//this.app.use(authentication.check_user());
			//this.app.use(req_limit.user());
		//});
		
		this.parent(options);//override default options
		
		
	}
	
});
