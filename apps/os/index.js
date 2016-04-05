'use strict'

var App = require('node-express-app'),
	path = require('path'),
	os = require('os');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
	id: 'os',
	path: '/os',
	
	//authorization: {
		//config: path.join(__dirname,'./config/rbac.json'),
	//},
	
	params: {
	  //route: /^(0|[1-9][0-9]*)$/,
	},
	
	routes: {
		
		/*all: [
		  {
			path: '',
			callbacks: ['get']
		  },
		]*/
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
  get: function (req, res, next){
	  var json = {};
	  Object.each(os, function(item, key){
		  console.log('OS.'+key);
		  //console.log('OS.'+item);
		  if(key != 'getNetworkInterfaces')//deprecated func
			json[key] = (typeof(item) == 'function') ? os[key]() : os[key];
			
	  });
	  
	  //console.log('OS.'+json);
	  res.json(json);
  },
  initialize: function(options){
	
	//dynamically create routes based on OS module (ex: /os/hostname|/os/cpus|...)
	Object.each(os, function(item, key){
		if(key != 'getNetworkInterfaces'){//deprecated func
			var callbacks = [];
			
			this[key] = function(req, res, next){
				res.send([(typeof(item) == 'function') ? os[key]() : os[key]]);
			}
			
			this.options.api.routes.all.push({
					path: key,
					callbacks: [key]
			});
		}
	}.bind(this));
		
	this.parent(options);//override default options
	
	this.log('os', 'info', 'os started');
  },
	
});

