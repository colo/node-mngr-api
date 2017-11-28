'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

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
			path: './logs' 
		},
		
		
		
	},
	
});
