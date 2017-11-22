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
					//{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
					/**
					 * *curl -H "Content-Type:application/json" -H "Accept:application/json" -H "Authorization: Basic bGJ1ZW5vOjEyMw==" http://localhost:8081/
					 * */
					{ id: 1, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
					{ id: 2, username: 'test' , role: 'user', password: '123'}
			],
		},
		
	},
	initialize: function(options){
		/**
		 * test, add 'check_authentication' & 'check_authorization' to each route
		 * */
		Object.each(this.options.api.routes, function(routes, verb){
			
			Array.each(routes, function(route){
					route.callbacks.unshift('check_authorization');
					route.callbacks.unshift('check_authentication');
					
			});
		});
		
		this.parent(options);//override default options
		
	}
	
});
