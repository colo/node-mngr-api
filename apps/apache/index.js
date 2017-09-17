'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  //authorization:null,
  //authentication: null,
  
  conf_dir: path.join(__dirname,"../../devel/etc/apache2/"),
  
  options: {
	  
		id: 'apache',
		path: '/apache',
		
		params: {
			//id: /^(0|[1-9][0-9]*)$/,
			//username:
			//role:
			//password:
		},
		
		routes: {
			
			//all: [
				//{
				//path: '',
				//callbacks: ['get']
				//},
			//]
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

  get: function(req, res, next){
		
		res.status(200);
			
		res.format({
			'text/plain': function(){
				res.send('apache app');
			},

			'text/html': function(){
				res.send('<h1>apache app</h1');
			},

			'application/json': function(){
				res.send({info: 'apache app'});
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable');
			}
		});
			
  },
  initialize: function(options){
		this.profile('apache_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('apache_init');//end profiling
		
		this.log('apache', 'info', 'apache started');
  },
  
});
