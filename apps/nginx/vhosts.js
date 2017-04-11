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
			enabled: path.join(__dirname,"../../devel/etc/nginx/sites-enabled/"),
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
						path: 'enabled',
						callbacks: ['get'],
						version: '',
					},
					{
						path: ':uri',
						callbacks: ['get'],
						version: '',
					},
					{
						path: ':uri/:prop_or_index',
						callbacks: ['get'],
						version: '',
					},
					{
						path: ':uri/:prop_or_index/:prop',
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
	
	conf_to_obj: function(conf){
		//console.log('---conf_to_obj----');
		//console.log(conf);
		
		var cfg = {};
		Object.each(conf, function(value, prop){
			
			if(prop.charAt(0) != '_' && prop != 'toString'){
				//console.log('prop: '+prop);
				//console.log('value: '+value._value);
				
				if(value instanceof Array){
					cfg[prop] = [];
					
					Array.each(value, function(val){
						
						//cfg[prop].push(val._value);
						var properties = this.conf_to_obj(val);
						
						if(Object.getLength(properties) > 0){
							
							cfg[prop].push(
								Object.merge({
									value : val._value
								},
								properties)
							);
							
						}
						else{
							cfg[prop].push(val._value);
						}
						
					}.bind(this));
				}
				//else if(!value._value){
					//cfg[prop] = this.conf_to_obj(value);
				//}
				else{
					var properties = this.conf_to_obj(value);
					
					//console.log(properties);
					
					if(Object.getLength(properties) > 0){
						cfg[prop] = Object.merge({
							value : value._value
						},
						properties);
					}
					else{
						cfg[prop] = value._value;
					}
					
					//console.log(this.conf_to_obj(value));
				}
			}
			
		}.bind(this));
		
		return cfg;
	},
	read_vhosts_full: function(vhosts, callback){
		var cfg = null;
		
		if(vhosts instanceof Array){
			var tmp_cfg = [];
			Array.each(vhosts, function(vhost, index){
				
				this.read_vhosts_full(vhost, function(cfg){
					//console.log('---recursive----');
					//console.log(cfg);
					
					tmp_cfg = tmp_cfg.concat(cfg);
					
					if(index == vhosts.length - 1){
						callback(tmp_cfg);
					}
				});
				
			}.bind(this));
			
		}
		else{
			var file = vhosts.file;
			var vhost = vhosts.uri;
			
			nginx.create(file, function(err, conf) {
				if (err) {
					console.log(err);
					return;
				}
			 
				//don't write to disk when something changes 
				conf.die(file);
				
				//console.log('read_vhost');
				//console.log(conf.nginx.server);
				
				//Array.each(conf.nginx.server, function(server){
					//console.log(server.server_name._value.clean().split(" "));
				//});
				
				var all_uris = [];
				
				if(conf.nginx.server instanceof Array){
					cfg = [];
					
					Array.each(conf.nginx.server, function(server){
						all_uris = server.server_name._value.clean().split(" ");
						
						
						//var tmp_cfg = {};
						
						Array.each(all_uris, function(uri){
							
							if(vhost == uri){
								//tmp_cfg = {
									//server_name: uri,
									//listen: server.listen._value,
								//};
								
								cfg.push(this.conf_to_obj(server));
								
							}
							
							
							
						}.bind(this));

					}.bind(this));
				}
				else{
					all_uris = conf.nginx.server.server_name._value.clean().split(" ");
					var server = conf.nginx.server;
					
					Array.each(all_uris, function(uri){
							
						if(vhost == uri){
							cfg = this.conf_to_obj(server);
						}
						
					}.bind(this));
					
					//console.log('---NO ARRAY----');
					//console.log(cfg);
				}
				
				//console.log(cfg);
				callback(cfg);
				
			}.bind(this));
			
		}	//else
		
	},
	read_vhosts_simple: function(file, callback){
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
		
		console.log('----conf_path---');
		console.log(conf_path);
		
		//try{
		if(fs.statSync(conf_path).isDirectory() == true){
			
			var files = fs.readdirSync(conf_path);
			var vhosts = [];
			
			Array.each(files, function(file, index) {
				

				var full_conf_path = path.join(conf_path, file);
				
				var isFile = false;
				
				try{
					isFile = fs.statSync(full_conf_path).isFile();
				}
				catch(e){}
				
				if(
					isFile == true &&
					( ext == null || path.extname(file).match(ext) )&&
					file.charAt(0) != '.'
				)
				{
					
					this.read_vhosts_simple(full_conf_path, function(cfg){
						//console.log(cfg);
						vhosts = vhosts.concat(cfg);
						
						//console.log(file);
					
						if(index == files.length - 1){
							callback(vhosts);
						}
					});
					
					
					
				}
				//else{
					//if(index == files.length - 1){
						//callback(vhosts);
					//}
				//}
			
			}.bind(this));
		}
		else if(fs.statSync(conf_path).isFile() == true){
			this.read_vhosts_simple(full_conf_path, callback);
		}
		//}
		//catch(e){
		//}
	},
	/**
	 * sync = available || enbaled
	 * */
	sync_vhosts: function(sync, callback){
		
		if(this.options.conf_path[sync] instanceof Array){
			var vhosts = [];
			
			Array.each(this.options.conf_path[sync], function(dir, index){
				this.scan_vhosts(
					dir,
					this.options.conf_ext[sync],
					function(cfg){
						vhosts = vhosts.concat(cfg);
						if(index == this.options.conf_path[sync].length - 1){
							//console.log('index: '+index);
							//console.log(vhosts);
							
							callback(vhosts);
							
						}
					}.bind(this)
				);
				
				
					
			}.bind(this));
			
		}
		else{
			//console.log(this.options.conf_path[sync]);
			this.scan_vhosts(
				this.options.conf_path[sync],
				this.options.conf_ext[sync],
				callback
			);
		}
	},
  get: function(req, res, next){
		console.log(req.path);
		console.log(req.params);
		
		var callback = function(vhosts){
			//console.log('----SCANNED---');
			//console.log(vhosts);
			//console.log(vhosts.length);
			
			var send = null;
			
			if(req.params.uri){
					
				var tmp_files = [];
				var read_vhosts = [];
				
				for(var i = 0; i < vhosts.length; i++){
					
					if(vhosts[i].uri == req.params.uri){//found
						
						if(tmp_files.indexOf(vhosts[i].file) == -1){//if file was not include already, include vhost
							read_vhosts.push(vhosts[i]);
						}
						
						tmp_files.push(vhosts[i].file);
					}
						
				}
				
				console.log('---read_vhosts---');
				console.log(read_vhosts);
				
				if(read_vhosts.length == 0){//no match
					res.status(404).json({error: 'URI/server_name Not Found'});
				}
				else{
					
					if(read_vhosts.length == 1)//if only one match, should return a vhost {}, not an [] of vhosts
						read_vhosts = read_vhosts[0];
						
					this.read_vhosts_full(read_vhosts, function(cfg){
						
						if(req.params.prop_or_index){
							
							// mootols 1.6 vs 1.5
							var index = (Number.convert) ? Number.convert(req.params.prop_or_index) : Number.from(req.params.prop_or_index);
							var prop = (index == null) ? req.params.prop_or_index : req.params.prop;
							//prop = (prop == undefined) ? null : prop;
							
							console.log('INDEX');
							console.log(index);
							console.log(prop);
							
							if(cfg instanceof Array){
								
								if(index != null){
									if(cfg[index]){
										if(prop && cfg[index][prop]){
											res.json(cfg[index][prop]);
										}
										else if(prop != undefined && !cfg[index][prop]){
											res.status(404).json({error: 'Property Not Found'});
										}
										else{
											res.json(cfg[index]);
										}
									}
									else{
										res.status(404).json({error: 'Index Not Found'});
									}
								}
								else{
									var props = [];
									Array.each(cfg, function(vhost, index){
											if(vhost[prop]){
												props[index] = vhost[prop];
											}
									});
									
									if(props.length > 0){
										res.json(props);
									}
									else{
										res.status(404).json({error: 'Property Not Found'});
									}
								}
							}
							else{
								if(index == 0 && !prop){//if there is only one vhost and index=0, return that vhost
									res.json(cfg);
								}
								else{	
									
									if(cfg[prop]){
										res.json(cfg[prop]);
									}
									else{
										res.status(404).json({error: 'Property Not Found'});
									}
								}
								
							}
						}
						else{
							res.json(cfg);
						}
						
					});
				
				}
			}
			else{//complete vhosts list
				send = [];
				
				for(var i = 0; i < vhosts.length; i++){
					if(send.indexOf(vhosts[i].uri) == -1)//not found
						send.push(vhosts[i].uri);
				}
				
				res.json(send);

			}
			
			
		}.bind(this);
		
		var sync = (req.path.indexOf('enabled') != -1) ? 'enabled' : 'available';
		this.sync_vhosts(sync, callback);
		
		
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
