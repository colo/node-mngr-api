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
  config: {},
  
  
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
		
		console.log(this.config);
		res.json(this.config);
		//res.json({info: 'dirvish config api'});
  },
  initialize: function(options){
	
		this.parent(options);//override default options
		
		this.files.each(function(file, index){
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				
				//this.config = dirvish.conf(file_path);

				dirvish.vaults(file_path)
				.then(function(vaults){
					this.config = vaults;
					
					console.log('this.vaults');
					console.log(vaults);
					
				}.bind(this))
				.done();
				
				throw new Error('Read: '+ file_path);//break the each loop
			}
			catch(e){
				console.log(e);
			}
			
			
		}.bind(this));
		
		
		this.log('vaults', 'info', 'dirvish vaults started');
  },

  
});

