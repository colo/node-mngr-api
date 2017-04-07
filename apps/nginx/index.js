'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util'),
	nginx = require('nginx-conf').NginxConfFile;


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  //authorization:null,
  //authentication: null,
  
  conf_dir: path.join(__dirname,"../../devel/etc/nginx/"),
  
  options: {
	  
		id: 'nginx',
		path: '/nginx',
		
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
		
		nginx.create(this.conf_dir+'nginx.conf', function(err, conf) {
			if (err) {
				console.log(err);
				return;
			}
		 
			//reading values 
			//console.log(conf.nginx.http.include[0]._value);
			
			//don't write to disk when something changes 
			conf.die(this.conf_dir+'nginx.conf');

		}.bind(this));	
		
		nginx.create(this.conf_dir+'sites-available/ssl/campus.apci.org.ar', function(err, conf) {
			if (err) {
				console.log(err);
				return;
			}
		 
			//reading values 
			console.log(conf.nginx);
			
			//don't write to disk when something changes 
			conf.die(this.conf_dir+'sites-available/ssl/campus.apci.org.ar');

		}.bind(this));	
		
		res.status(200);
			
		res.format({
			'text/plain': function(){
				res.send('nginx app');
			},

			'text/html': function(){
				res.send('<h1>nginx app</h1');
			},

			'application/json': function(){
				res.send({info: 'nginx app'});
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable');
			}
		});
			
  },
  initialize: function(options){
		this.profile('nginx_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('nginx_init');//end profiling
		
		this.log('nginx', 'info', 'nginx started');
  },
  
});
