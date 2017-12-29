'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

//var winston = require('winston');
const limit = require('node-limit/rate/request');
var req_limit = new limit({
									limit: 1,
									interval: 500
								});

var req_max = new limit({
									limit: 2,
									interval: 5000
								});
								
module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		//middlewares: [req_limit.ip(), req_limit.user()],
		middlewares: [req_limit.ip(), req_max.ip()],
		
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
		
		
		
	},
	
});
