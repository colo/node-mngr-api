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
  post: function (req, res, next){//creates config
		
	}, 
  put: function (req, res, next){//update existing config
		
		console.log('put body');
		console.log(req.body);
		
		this.files.each(function(file, index){
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				
				dirvish.save(this.cfg, file_path);

				throw new Error('Read: '+ file_path);//break the each loop
			}
			catch(e){
				console.log(e);
			}
			
			
		}.bind(this));
		
		res.json({status: 'ok'});
		
		console.log(this.config);
	},
  get: function (req, res, next){
		var key = req.params.key;
		var prop = req.params.prop;
		
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
		

  },
  initialize: function(options){
		this.parent(options);//override default options
		
		this.files.each(function(file, index){
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				
				//this.cfg = dirvish.conf(file_path);

				dirvish.conf(file_path)
				.then(function(config){
					this.cfg = config;
					
					
					////here is when it really finished the init process
					this.log('config', 'info', 'dirvish config started');
						
				}.bind(this))
				.done();
				
				throw new Error('Read: '+ file_path);//break the each loop
			}
			catch(e){
				console.log(e);
			}
			
			
		}.bind(this));
		
		
  },

  
});

