'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

//var winston = require('winston');

module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
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
