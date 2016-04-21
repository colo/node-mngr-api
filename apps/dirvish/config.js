'use strict'

var App = require('node-express-app'),
	path = require('path'),
	Q = require('q'),
	fs = require('fs'),
	dirvish = require('nodejs-dirvish');
	
module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  files: ["../../devel/etc/dirvish.conf", "../../devel/etc/dirvish/master.conf"],
  cfg_file: null,
  
  cfg: {},
  
  
  options: {
	  
		id: 'config',
		path: '/config',
		
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
				post: [
					{
						path: '',
						callbacks: ['post'],
						version: '',
					}
				],
				put: [
					{
						path: '',
						callbacks: ['put'],
						version: '',
					}
				],
				
				all: [
					{
						path: ':key',
						callbacks: ['get'],
						version: '',
					},
					{
						path: ':key/:prop',
						callbacks: ['get'],
						version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				]
			},
			
		},
  },
  format: function(json){
		var cfg = {};
		
		Object.each(json, function(value, key){
			//console.log('key: '+key);
			//console.log(value);
			//console.log('typeof: '+typeof(value));
			
			if(/SET|UNSET|RESET/.test(key) &&
				typeof(value) != 'array' &&
				typeof(value) != 'object' ){//the onlye 3 options that don't use colons <:>
					
				cfg[key] = value.split(' ');
			}
			else{
				cfg[key] = value;
			}
		});
		
		return cfg;
	},
	post: function (req, res, next){//discard existing config, create new
		
		this.cfg = this.format(req.body);
			
		dirvish.save(this.cfg, this.cfg_file);
			
		dirvish.conf(this.cfg_file)
		.then(function(config){//read saved config
				
			this.cfg = config;
			res.json(config);
				
		}.bind(this))
		.done();

	},
  put: function (req, res, next){//update existing config
		
		dirvish.conf(this.cfg_file)
		.then(function(config){//read config
			this.cfg = config;
			
			var appendable = this.format(req.body);
			
			Object.append(this.cfg, appendable);
			
			dirvish.save(this.cfg, this.cfg_file);
			
			dirvish.conf(this.cfg_file)//re-read saved config
			.then(function(config){
				
				this.cfg = config;
				res.json(config);
				
			}.bind(this))
			.done();
			
		}.bind(this))
		.done();
		
	},
  get: function (req, res, next){
		var key = req.params.key;
		var prop = req.params.prop;
		
		dirvish.conf(this.cfg_file)
		.then(function(config){
			this.cfg = config;
			
			if(key && this.cfg[key]){
				if(prop && this.cfg[key][prop]){
					res.json(this.cfg[key][prop]);
				}
				else if(prop){
					res.status(500).json({ error: 'Bad property['+prop+'] for key: '+key});
				}
				else{
					res.json(this.cfg[key]);
				}
				
			}
			else if(key){
				res.status(500).json({ error: 'Bad config key:'+key});
			}
			else{
				res.json(this.cfg);
			}
		}.bind(this))
		.done();

  },
  initialize: function(options){
		this.parent(options);//override default options
		
		this.files.each(function(file, index){
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				this.cfg_file = file_path;
				
				throw new Error('Read: '+ file_path);//break the each loop
			}
			catch(e){
				console.log(e);
			}
			
			
		}.bind(this));
		
		this.log('dirvish-config', 'info', 'dirvish config started');
		
  },

  
});

