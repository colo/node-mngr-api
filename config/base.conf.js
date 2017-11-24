'use strict'

const App = require('node-express-app'),
			os = require('os'),
			path = require('path');

module.exports = new Class({
  Extends: App,
	
	app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
	options: {
	  
		id: os.hostname(),
		path: '/',
		
		cors: {
			'exposedHeaders': ['Link', 'Content-Range']
		},
		
		logs: null,
		
		authentication: {
			users : [
					{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
			],
		},
		
		authorization: {
			config: path.join(__dirname,'./rbac.json'),
		},
		
		routes: {
			
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
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
  
});

