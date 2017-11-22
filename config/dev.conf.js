'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		logs: { 
			path: './logs' 
		},
		
		authentication: {
			users : [
					{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
			],
		},
		
	},
	
});
