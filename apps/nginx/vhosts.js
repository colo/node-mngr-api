'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util'),
	fs = require('fs'),
	nginx = require('nginx-conf').NginxConfFile;


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  //authorization:null,
  //authentication: null,
  
  options: {
		conf_path: {
			available: [ 
				path.join(__dirname,"../../devel/etc/nginx/sites-available/"),
				path.join(__dirname,"../../devel/etc/nginx/sites-available/proxies/"),
				path.join(__dirname,"../../devel/etc/nginx/sites-available/redirects/"),
				path.join(__dirname,"../../devel/etc/nginx/sites-available/ssl/"),
			],
			enabled: (__dirname,"../../devel/etc/nginx/sites-enabled/"),
		},
		
		conf_ext: {
			//available: new RegExp("\\w+", "gi"),
			//enabled: new RegExp("\\w+", "gi"),
			available: null,
			enabled: null,
		},
		
		id: 'nginx_vhosts',
		path: '/nginx/vhosts',
		
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
	
	read_vhosts: function(file, callback){
		var vhosts = [];
		
		nginx.create(file, function(err, conf) {
			if (err) {
				console.log(err);
				return;
			}
		 
			//don't write to disk when something changes 
			conf.die(file);
			
			var all_uris = [];
			
			if(conf.nginx.server instanceof Array){
				Array.each(conf.nginx.server, function(server){
					all_uris = server.server_name._value.clean().split(" ");
					
					Array.each(all_uris, function(uri){
						
						vhosts.push({
							uri: uri,
							file: file
						});
						
					});

				});
			}
			else{
				all_uris = conf.nginx.server.server_name._value.clean().split(" ");
				
				Array.each(all_uris, function(uri){
						
					vhosts.push({
						uri: uri,
						file: file
					});
					
				});

			}
			
			callback(vhosts);
			
		}.bind(this));
		
	},
	scan_vhosts: function(conf_path, ext, callback){
		
		if(fs.statSync(conf_path).isDirectory() == true){
			
			var files = fs.readdirSync(conf_path);

			Array.each(files, function(file, index) {
				

				var full_conf_path = path.join(conf_path, file);
				
				if(
					fs.statSync(full_conf_path).isFile() == true &&
					( ext == null || path.extname(file).match(ext) )&&
					file.charAt(0) != '.'
				)
				{
					
					//console.log(file);
					
					this.read_vhosts(full_conf_path, callback);
					
				}
				
			
			}.bind(this));
		}
		else if(fs.statSync(conf_path).isFile() == true){
			this.read_vhosts(full_conf_path, callback);
		}
		
	},
	sync_vhosts: function(callback){
		if(this.options.conf_path.available instanceof Array){
			var vhosts = [];
			
			Array.each(this.options.conf_path.available, function(dir, index){
				this.scan_vhosts(
					dir,
					this.options.conf_ext.available,
					function(cfg){
						vhosts = vhosts.concat(cfg);
						if(index == this.options.conf_path.available.length - 1){
							
							callback(vhosts);
							
						}
					}.bind(this)
				);
				
				
					
			}.bind(this));
			
		}
		else{
			this.scan_vhosts(
				dir,
				this.options.conf_ext.available,
				callback
			);
		}
	},
  get: function(req, res, next){
		
		this.sync_vhosts(function(vhosts){
			//console.log('----SCANNED---');
			//console.log(vhosts);
			//console.log(vhosts.length);
			var send = [];
			
			for(var i = 0; i < vhosts.length; i++){
				if(send.indexOf(vhosts[i].uri) == -1)//not found
					send.push(vhosts[i].uri);
			}
			
			res.json(send);
		});
		
		
		//res.status(200);
			
		//res.format({
			//'text/plain': function(){
				//res.send('nginx vhosts app');
			//},

			//'text/html': function(){
				//res.send('<h1>nginx vhosts app</h1');
			//},

			//'application/json': function(){
				//res.send({info: 'nginx vhosts app'});
			//},

			//'default': function() {
				//// log the request and respond with 406
				//res.status(406).send('Not Acceptable');
			//}
		//});
			
  },
  initialize: function(options){
		this.profile('nginx_vhosts_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('nginx_vhosts_init');//end profiling
		
		this.log('nginx_vhosts', 'info', 'nginx_vhosts started');
  },
  
});
