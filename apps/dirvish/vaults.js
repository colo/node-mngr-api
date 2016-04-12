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
		
		//console.log(this.cfg);
		res.json(this.cfg);
		//res.json({info: 'dirvish config api'});
  },
  initialize: function(options){
	
		this.parent(options);//override default options
		
		this.files.each(function(file, index){
			
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				
				//this.config = dirvish.conf(file_path);
				
				console.log('this.vaults');
				console.log(dirvish.vaults(file_path));
				
				dirvish.vaults(file_path)
				.then(function(vaults){
					this.cfg = vaults;
					
					console.log('this.vaults');
					console.log(this.cfg);
					
					Object.each(vaults, function(item, key){
						var callbacks = [];
						
						this[key] = function(req, res, next){
							console.log('params');
							console.log(req.params);
							
							
							if(req.params.prop && vaults[key][req.params.prop]){
								res.json(vaults[key][req.params.prop]);
							}
							else if(req.params.prop){
								res.status(500).json({ error: 'Bad property'});
							}
							else{
								res.json(vaults[key]);
							}
							
							
						}
						
						console.log('dirvish-vaults-routes');
						console.log(key);
						
						this.options.api.routes.all.push({
								path: key,
								callbacks: [key]
						});
						
						this.options.api.routes.all.push({
								path: key+'/:prop',
								callbacks: [key]
						});
						
						
					}.bind(this));
					
					//here is when it really finished the init process
					this.apply_api_routes();//need to re run this parent.func to apply this routes
					this.log('vaults', 'info', 'dirvish vaults started');
					
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

