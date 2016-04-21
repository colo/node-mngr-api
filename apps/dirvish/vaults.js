'use strict'

var App = require('node-express-app'),
	path = require('path'),
	Q = require('q'),
	fs = require('fs'),
	dirvish = require('nodejs-dirvish');
	
//const readline = require('readline'),
			//fs = require('fs');


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
	  
		id: 'vaults',
		path: '/vaults',
		
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
					/**
					* hist needs to be before :key path, or won't be proceded
					* 
					* */
					{
						path: 'hist/:key',
						callbacks: ['hist'],
						version: '',
					},
					{
						path: 'hist',
						callbacks: ['hist'],
						version: '',
					},
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
						path: ':key/config/:item',
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
	hist: function (req, res, next){
		var key = req.params.key;
		
		if(!key){
			res.status(500).json({ error: 'you must specify a vault'});
		}
		else{
			dirvish.vaults(this.cfg_file)
			.then(function(config){//read config
				console.log('HIST this.vaults');
				console.log(config);
						
				this.cfg = config;
				console.log(this.cfg);
				
				if(this.cfg[key] && this.cfg[key]['hist']){
					//res.json(config);
					dirvish.hist(this.cfg[key]['hist'])//re-read saved config
					.then(function(config){
						//this.cfg = config;
						//res.json(config);
						console.log('HIST');
						console.log(config);
						
						res.json(config);
						
					}.bind(this))
					.done();
				}
				else if(this.cfg[key]){
					res.status(500).json({ error: 'There is no history for vault: '+key});
				}
				else{
					res.status(500).json({ error: 'There is no vault: '+key});
				}
				
				
				
			}.bind(this))
			.done();
		}
	},
	post: function (req, res, next){//discard existing VAULT config, create new
		
		var appendable = {};
		
		Object.each(req.body, function(value, key){
			appendable[key] =  {};
			appendable[key]['config'] =  this.format(value);
		}.bind(this));
		
		dirvish.vaults(this.cfg_file)
		.then(function(config){//read config
			console.log('POST this.vaults');
			console.log(config);
					
			this.cfg = config;
			console.log(this.cfg);
			
			Object.each(this.cfg, function(value, key){
				this.cfg[key]['config'] = appendable[key]['config'];//discard old config, set value to new one
				dirvish.save(this.cfg[key]['config'], value['path']);
			}.bind(this));
			
			//res.json(config);
			dirvish.vaults(this.cfg_file)//re-read saved config
			.then(function(config){
				
				this.cfg = config;
				res.json(config);
				
			}.bind(this))
			.done();
			
		}.bind(this))
		.done();
	},
	
  put: function (req, res, next){//update existing config
		
		var appendable = {};
		
		Object.each(req.body, function(value, key){
			appendable[key] =  {};
			appendable[key]['config'] =  this.format(value);
		}.bind(this));
		
		dirvish.vaults(this.cfg_file)
		.then(function(config){//read config
			console.log('PUT this.vaults');
			console.log(config);
					
			//this.cfg = config;
			this.cfg = Object.merge(config, appendable);
			
			console.log(this.cfg);
			
			Object.each(this.cfg, function(value, key){
				dirvish.save(value['config'], value['path']);
			});
			
			//res.json(config);
			dirvish.vaults(this.cfg_file)//re-read saved config
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
		var item = req.params.item;
		
		dirvish.vaults(this.cfg_file)
		.then(function(config){
			console.log('this.vaults');
			console.log(config);
					
			this.cfg = config;
			
			if(key && this.cfg[key]){
				if(item && this.cfg[key]['config'][item]){
					res.json(this.cfg[key]['config'][item]);
				}
				else if(item){
					res.status(500).json({ error: 'Bad item['+item+'] for config key: '+key});
				}
				else if(prop && this.cfg[key][prop]){
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
		
		this.log('dirvish-vaults', 'info', 'dirvish vaults started');
		
  },
  
});

