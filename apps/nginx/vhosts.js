'use strict'

var App = require('node-express-app'),
	os = require('os'),
	path = require('path'),
	util = require('util'),
	fs = require('fs'),
	nginx = require('nginx-conf').NginxConfFile,
	lockFile = require('lockfile');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  //authorization:null,
  //authentication: null,
  
  comments: true,
  
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
				post: [
					{
						path: 'enabled',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['add'],
						version: '',
					},
					{
						path: 'enabled/:uri',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['add'],
						version: '',
					},
					{
						path: ':uri',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['add'],
						version: '',
					},
					{
						path: '',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['add'],
						version: '',
					},
				],
				put: [
					{
						path: 'enabled',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: 'enabled/:uri',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: 'enabled/:uri/:prop_or_index',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: 'enabled/:uri/:prop_or_index/:prop',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: ':uri',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: ':uri/:prop_or_index',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: ':uri/:prop_or_index/:prop',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
					{
						path: '',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['update'],
						version: '',
					},
				],
				delete: [
					{
						path: 'enabled',
						callbacks: ['remove'],
						version: '',
					},
					{
						path: 'enabled/:uri',
						callbacks: ['remove'],
						version: '',
					},
					{
						path: 'enabled/:uri/:index',
						callbacks: ['remove'],
						version: '',
					},
					{
						path: ':uri',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['remove'],
						version: '',
					},
					{
						path: ':uri/:index',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['remove'],
						version: '',
					},
					{
						path: '',
						//callbacks: ['check_authentication', 'add'],
						callbacks: ['remove'],
						version: '',
					},
				],
				get: [
					{
						path: 'enabled',
						callbacks: ['get'],
						version: '',
					},
					{
						path: 'enabled/:uri',
						callbacks: ['get'],
						version: '',
					},
					{
						path: 'enabled/:uri/:prop_or_index',
						callbacks: ['get'],
						version: '',
					},
					{
						path: 'enabled/:uri/:prop_or_index/:prop',
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
				],
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
	
	add: function(req, res, next){
		var prop = req.body;
		var cfg = {};
		
		this.comments = (req.query && req.query.comments == "false") ? false : true;
		
		if(req.params.uri){//if vhost uri sent
			
			//convert prop to nginx.conf and save
			//cfg = Object.merge(cfg, Object.clone(prop));
			if(prop['server_name']){
				prop['server_name'] = req.params.uri+' '+prop['server_name'];
			}
			else{
				prop['server_name'] = req.params.uri;
			}
				
			cfg = this.obj_to_conf(prop);
			res.json(cfg);
									
			//var read_vhosts = this.search_unique_vhost(vhosts, req.params.uri);
			
			////console.log('---read_vhosts---');
			////console.log(read_vhosts);
			
			//if(read_vhosts.length == 0){//no match
				//res.status(404).json({error: 'URI/server_name Not Found'});
			//}
			//else{
				
				//if(read_vhosts.length == 1)//if only one match, should return a vhost {}, not an [] of vhosts
					//read_vhosts = read_vhosts[0];
				
				////with {uri,file} info, read whole vhost config	
				//this.read_vhosts_full(read_vhosts, function(cfg){
					
					//if(req.params.prop_or_index){
						
						//// is Numberic index or a property String - mootols 1.6 vs 1.5
						//var index = (Number.convert) ? Number.convert(req.params.prop_or_index) : Number.from(req.params.prop_or_index);
						
						////if index was String, take it as property
						////var prop = (index == null) ? req.params.prop_or_index : req.params.prop;
						////var prop = req.body;
						
						//////console.log('INDEX');
						//////console.log(index);
						//////console.log(prop);
						
						//if(cfg instanceof Array){//multiple vhosts
							
							//if(index != null){//seacrh for vhost matching index on []
								
								//if(cfg[index]){//exist
									
									////if(prop && cfg[index][prop]){//property exists
										////res.json(cfg[index][prop]);
									////}
									////else if(prop != undefined && !cfg[index][prop]){
										////res.status(404).json({error: 'Property Not Found'});
									////}
									////else{// property param wasn't set at all, return vhost matching index on []
										////res.json(cfg[index]);
									////}
									
									////convert prop to nginx.conf and save
									//cfg[index] = Object.merge(cfg[index], Object.clone(prop));
									//res.json(cfg[index]);
								//}
								//else{//index doens't exist
									//res.status(404).json({error: 'Index Not Found'});
								//}
							//}
							//else{//no index sent, search for matching property on every vhost on []
								////var props = [];
								//Array.each(cfg, function(vhost, index){
									////convert prop to nginx.conf and save
									//vhost = Object.merge(vhost, Object.clone(prop));
								//});
								
								//res.json(cfg);
								
								////if(props.length > 0){
									////res.json(props);
								////}
								////else{
									////res.status(404).json({error: 'Property Not Found'});
								////}
							//}
						//}
						//else{//single vhosts
							
							//if(index == 0 || index == null){//if there is only one vhost and index=0, return that vhost
								////convert prop to nginx.conf and save
								//cfg = Object.merge(cfg, prop);
								//res.json(cfg);
							//}
							//else{	
								//res.status(404).json({error: 'No matching vhost'});
							//}
							
							
						//}
					//}
					//else{//no 'prop_or_index' param sent, return full vhost or []
						
						//if(cfg instanceof Array){
							////for(var index = 0; index < cfg.length; index++ ){
								//////convert prop to nginx.conf and save
								////cfg[index] = Object.merge(cfg[index], Object.clone(prop));
								//////console.log('----VHOST-----');
								//////console.log(cfg[index]);
								//////console.log(Object.clone(prop));
								
							////}
							//Array.each(cfg, function(vhost, index){
								////convert prop to nginx.conf and save
								//cfg[index] = Object.merge(cfg[index], Object.clone(prop));
								
								//////console.log('----VHOST-----');
								//////console.log(cfg[index]);
								//////console.log(prop);
							//});
							
							//////console.log('----NO INDEX----');
							//////console.log(cfg);
							//res.json(cfg);
						//}
						//else{
							//cfg = Object.merge(cfg, prop);
							//res.json(cfg);
						//}
					//}
					
				//});
			
			//}
		}
		else{//no uri sent, that's an error
			res.status(500).json({error: 'Vhost not specified.'});
		}
		
		/**
		 * per default will add on 'available' vhosts, unless request path is /vhosts/enabled/
		 * if added on "enabled", automatically will add it to "available"
		 * */
		//var sync = (req.path.indexOf('enabled') != -1) ? 'enabled' : 'available';
		//this.sync_vhosts(sync, callback);
		
		
	},
	remove: function(req, res, next){
		
		var callback = function(vhosts){
			//console.log('----SCANNED---');
			//console.log(vhosts);
			////console.log(vhosts.length);
			
			var send = null;
			
			if(req.params.uri){//if vhost uri sent
					
				
				//var read_vhosts = this.search_unique_vhost(vhosts, req.params.uri);
				var read_vhosts = this.search_vhost(vhosts, req.params.uri);
				
				
				////console.log('---read_vhosts---');
				////console.log(read_vhosts);
				
				if(read_vhosts.length == 0){//no match
					res.status(404).json({error: 'URI/server_name Not Found'});
				}
				else{
					
					if(read_vhosts.length == 1)//if only one match, should return a vhost {}, not an [] of vhosts
						read_vhosts = read_vhosts[0];
					
					//with {uri,file} info, read whole vhost config	
					this.read_vhosts_full(read_vhosts, function(cfg){
						
						if(req.params.index){
							
							// is Numberic index or a property String - mootols 1.6 vs 1.5
							var index = (Number.convert) ? Number.convert(req.params.index) : Number.from(req.params.index);
							
							//if index was String, take it as property
							//var prop = (index == null) ? req.params.prop_or_index : req.params.prop;
							
							
							//console.log('INDEX');
							//console.log(index);
							////console.log(prop);
							
							if(cfg instanceof Array){//multiple vhosts
								
								if(index != null){//seacrh for vhost matching index on []
									
									if(cfg[index]){//exist
										
										//should delete/remove vhost
										res.json(cfg[index]);
										
										
									}
									else{//index doens't exist
										res.status(404).json({error: 'Index Not Found'});
									}
								}
								else{//error, index is non Numeric
									
									res.status(500).json({error: 'Index is not Numeric'});
										
								}
							}
							else{//single vhosts
								
								//should delete/remove vhosts
								res.json(cfg);
								
							}
						}
						else{//no 'prop_or_index' param sent, delete/remove all vhosts on []
									
							//should delete/remove vhosts
							res.json(cfg);
						}
						
					});
				
				}
			}
			else{//no uri sent, that's an error
				res.status(500).json({error: 'Vhost not specified.'});
			}
			
			
		}.bind(this);
		
		/**
		 * per default will sync & search on 'available' vhosts, unless request path is /vhosts/enabled/
		 * if removed from "available", automatically will remove it from "enabled"
		 * */
		var sync = (req.path.indexOf('enabled') != -1) ? 'enabled' : 'available';
		this.sync_vhosts(sync, callback);
		
		//res.json({});
	},
	/**
	 * query with no comments: ?comments=false
	 * */
	get: function(req, res, next){
		//console.log(req.path);
		//console.log(req.params);
		//console.log(req.query);
		
		this.comments = (req.query && req.query.comments == "false") ? false : true;
		
		////console.log('comments');
		////console.log(this.comments);
		
		var callback = function(vhosts){
			////console.log('----SCANNED---');
			////console.log(vhosts);
			////console.log(vhosts.length);
			
			var send = null;
			
			if(req.params.uri){//if vhost uri sent
					
				//var read_vhosts = this.search_unique_vhost(vhosts, req.params.uri);
				var read_vhosts = this.search_vhost(vhosts, req.params.uri);
				
				////console.log('---read_vhosts---');
				////console.log(read_vhosts);
				
				if(read_vhosts.length == 0){//no match
					res.status(404).json({error: 'URI/server_name Not Found'});
				}
				else{
					
					if(read_vhosts.length == 1)//if only one match, should return a vhost {}, not an [] of vhosts
						read_vhosts = read_vhosts[0];
					
					//with {uri,file} info, read whole vhost config	
					this.read_vhosts_full(read_vhosts, function(cfg){
						
						if(req.params.prop_or_index){
							
							// is Numberic index or a property String - mootols 1.6 vs 1.5
							var index = (Number.convert) ? Number.convert(req.params.prop_or_index) : Number.from(req.params.prop_or_index);
							
							//if index was String, take it as property
							var prop = (index == null) ? req.params.prop_or_index : req.params.prop;
							
							
							////console.log('INDEX');
							////console.log(index);
							////console.log(prop);
							
							if(cfg instanceof Array){//multiple vhosts
								
								if(index != null){//search for vhost matching index on []
									
									if(cfg[index]){//exist
										
										if(prop && cfg[index][prop]){//property exists
											
											res.json(cfg[index][prop]);
										}
										else if(prop != undefined && !cfg[index][prop]){
											res.status(404).json({error: 'Property Not Found'});
										}
										else{// property param wasn't set at all, return vhost matching index on []
											res.json(cfg[index]);
										}
										
									}
									else{//index doens't exist
										res.status(404).json({error: 'Index Not Found'});
									}
								}
								else{//no index sent, search for matching property on every vhost on []
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
							else{//single vhosts
								
								if(index == 0 && !prop){//if there is only one vhost and index=0, return that vhost
									res.json(cfg);
								}
								else{	
									
									if(cfg[prop]){
										//if(!comments){
											
											//delete cfg[prop]['_comments'];
											//if(Object.getLength(cfg[prop]) == 1)//if there is only _value, return that
												//cfg[prop] = cfg[prop]['_value'];
												
										//}
										////console.log(cfg[prop]);
										
										res.json(cfg[prop]);
									}
									else{
										res.status(404).json({error: 'Property Not Found'});
									}
								}
								
							}
						}
						else{//no 'prop_or_index' param sent, return full vhost or []
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
		
		//per default will sync & search on 'available' vhosts, unless request path is /vhosts/enabled/
		var sync = (req.path.indexOf('enabled') != -1) ? 'enabled' : 'available';
		this.sync_vhosts(sync, callback);
		
			
  },
  
  ON_VHOST_ERROR: 'onVhostError',
  
  ON_VHOST_FOUND: 'onVhostFound',
  ON_VHOST_NOT_FOUND: 'onVhostNotFound',
  
  ON_VHOST_INDEX_FOUND: 'onVhostIndexFound',
  ON_VHOST_INDEX_NOT_FOUND: 'onVhostIndexNotFound',
  
  ON_VHOST_INDEX_PROP_FOUND: 'onVhostIndexPropFound',
  ON_VHOST_INDEX_PROP_NOT_FOUND: 'onVhostIndexPropNotFound',
  
  ON_VHOST_PROP_FOUND: 'onVhostPropFound',
  ON_VHOST_PROP_NOT_FOUND: 'onVhostPropNotFound',
  /**
	 * &listen=108.163.170.178:80&server_name=campus.apci.org.ar&location[value]=\&location[limit_req]=zone=default burst=4
	 * &include[]=/etc/nginx/conf.d/no_log.conf2&include[]=/etc/nginx/conf.d/errors.conf
	 *  
	 * */
	update: function(req, res, next){
		console.log(req.body);
		console.log(req.params);
		//throw new Error();
		
		this.comments = (req.query && req.query.comments == "false") ? false : true;
		
		var uri = req.params.uri;
		
		// is Numberic index or a property String - mootols 1.6 vs 1.5
		var index = (Number.convert) ? Number.convert(req.params.prop_or_index) : Number.from(req.params.prop_or_index);
		
		//if index was String, take it as property
		var prop = (index == null) ? req.params.prop_or_index : req.params.prop;
		
		if(prop == undefined &&
			Object.getLength(req.body) == 1 &&
			!(req.body['value'] || req.body['_value'])){//asume req.body to have the property
			prop = Object.keys(req.body)[0];
		}
		
		//var put_val = null;//value to PUT on property
		//if(req.body['value'] || req.body['_value']){
			//put_val = (req.body['value']) ? req.body['value'] : req.body['_value'];
		//}
		//else{
			//put_val = req.body;
		//}
		
		//console.log('PROP');
		//console.log(prop);
		
																								
		var callback = function(scaned_vhosts){
				
			var send = null;
			
			if(uri){//if vhost uri sent
				
				/**
				 * new func (scaned_vhosts, uri, index, prop)
				 * */	
				var read_vhosts = this.search_vhost(scaned_vhosts, uri);
				
				if(read_vhosts.length == 0){//no match
					
					this.fireEvent(this.ON_VHOST_NOT_FOUND, [req, res, next, [uri]]);
					
					//res.status(404).json({error: 'URI/server_name Not Found'});
				}
				else{
					
					if(read_vhosts.length == 1)//if only one match, should return a vhost {}, not an [] of vhosts
						read_vhosts = read_vhosts[0];
					
					//with {uri,file} info, read whole vhost config	
					this.read_vhosts_full(read_vhosts, function(cfg){
						
						if(index >= 0 || prop != undefined){
							
							if(cfg instanceof Array){//multiple vhosts
								
								if(index != null){//search for vhost matching index on []
									
									if(cfg[index]){//exist
										
										if(prop && cfg[index][prop]){//property exists
											
											this.fireEvent(this.ON_VHOST_INDEX_PROP_FOUND, [req, res, next, [cfg, index, prop, read_vhosts]]);
											
										}
										else if(prop != undefined && !cfg[index][prop]){
											
											this.fireEvent(this.ON_VHOST_INDEX_PROP_NOT_FOUND, [req, res, next, [cfg, index, prop, read_vhosts]]);
											
										}
										else{// property param wasn't set at all, return vhost matching index on []
											
											this.fireEvent(this.ON_VHOST_INDEX_FOUND, [req, res, next, [cfg, index, read_vhosts]]);
											
										}
										
										
									}
									else{//index doens't exist
										
										this.fireEvent(this.ON_VHOST_INDEX_NOT_FOUND, [req, res, next, [cfg, index, read_vhosts]]);
										
									}
								}
								else if(prop != undefined){//no index sent, search for matching property on every vhost on []
									
									var props = [];
									Array.each(cfg, function(vhost, index){
											if(vhost[prop]){
												props[index] = vhost[prop];
											}
									});
									
									if(props.length > 0){

										this.fireEvent(this.ON_VHOST_PROP_FOUND, [req, res, next, [cfg, props, prop, read_vhosts]]);
										
									}
									else{
										//this.fireEvent(this.ON_VHOST_PROP_NOT_FOUND, [req, res, next, [uri, prop]]);
										this.fireEvent(this.ON_VHOST_PROP_NOT_FOUND, [req, res, next, [cfg, props, prop, read_vhosts]]);
									}
									
									
								}
								else{
									this.fireEvent(this.ON_VHOST_ERROR, [req, res, next, [uri, 'Property undefined']]);
								}
							}
							else{//single vhosts
								
								if((index == 0 || index == null) && !prop ){//if there is only one vhost and index=0, return that vhost
									
									this.fireEvent(this.ON_VHOST_FOUND, [req, res, next, [cfg, read_vhosts]]);
									
								}
								else if((index == 0 || index == null) && prop){
									
									if(cfg[prop]){
										this.fireEvent(this.ON_VHOST_PROP_FOUND, [req, res, next, [cfg, null, prop, read_vhosts]]);
									}
									else{
										//this.fireEvent(this.ON_VHOST_PROP_NOT_FOUND, [req, res, next, [uri, prop]]);
										this.fireEvent(this.ON_VHOST_PROP_NOT_FOUND, [req, res, next, [cfg, null, prop, read_vhosts]]);
									}
									
								}
								else{
									this.fireEvent(this.ON_VHOST_INDEX_NOT_FOUND, [req, res, next, [cfg, index, read_vhosts]]);
								}
								
							}
						}
						else{//no 'prop_or_index' param sent, return full vhost or []
							this.fireEvent(this.ON_VHOST_FOUND, [req, res, next, [cfg, read_vhosts]]);
						}
						
						
						
					}.bind(this));
				
				}
			}
			else{//no uri sent, that's an error
				res.status(500).json({error: 'Vhost not specified.'});
			}
			
			
		}.bind(this);
		
		/**
		 * per default will sync & search on 'available' vhosts, unless request path is /vhosts/enabled/
		 * */
		var sync = (req.path.indexOf('enabled') != -1) ? 'enabled' : 'available';
		this.sync_vhosts(sync, callback);
		
	},
  initialize: function(options){
		this.profile('nginx_vhosts_init');//start profiling
		
		this.parent(options);//override default options
		
		/**
		 * ******************************
		 * generic Events for all methods
		 * ******************************
		 * */
		this.addEvent(this.ON_VHOST_NOT_FOUND, function(req, res, next, params){
			console.log('ON_VHOST_NOT_FOUND');
			var uri = params[0];
			res.status(404).json({error: 'URI/server_name: '+uri+' not Found'});
			
		}.bind(this));
		
		this.addEvent(this.ON_VHOST_INDEX_PROP_NOT_FOUND, function(req, res, next, params){
			console.log('ON_VHOST_INDEX_PROP_NOT_FOUND');
			var cfg = params[0];
			var index = params[1];
			var prop = params[2];
			var read_vhosts = params[3];
			
			if(req.method == 'GET'){
				res.status(404).json({error: 'Property: '+prop+' not found on URI/server_name: '+req.params.uri+' at index: '+index});
			}
			
		}.bind(this));
		
		this.addEvent(this.ON_VHOST_INDEX_NOT_FOUND, function(req, res, next, params){
			console.log('ON_VHOST_INDEX_NOT_FOUND');
			var cfg = params[0];
			var index = params[1];
			var read_vhosts = params[2];
			
			res.status(404).json({error: 'Index: '+index+' not found for URI/server_name: '+req.params.uri});
			
		}.bind(this));
		
		this.addEvent(this.ON_VHOST_PROP_NOT_FOUND, function(req, res, next, params){
			console.log('ON_VHOST_PROP_NOT_FOUND');
			var cfg = params[0];
			var props = params[1];
			var prop = params[2];
			var read_vhosts = params[3];

			if(req.method == 'GET'){
				res.status(404).json({error: 'Property: '+prop+' not found on URI/server_name: '+req.params.uri});
			}
		}.bind(this));
		
		this.addEvent(this.ON_VHOST_ERROR, function(req, res, next, params){
			console.log('ON_VHOST_ERROR');
			var error = params[0];
			res.status(500).json({error: error});
		}.bind(this));
		/**
		 * 
		 * */
		
		/**
		 * ******************************
		 * PUT/Update Events
		 * ******************************
		 * */
		
		var save_index_property = function(req, res, next, params){
			console.log('PUT: ON_VHOST_INDEX_PROP_FOUND || ON_VHOST_INDEX_PROP_NOT_FOUND');
			if(req.method == 'PUT'){
				var cfg = params[0];
				var index = params[1];
				var prop = params[2];
				var read_vhosts = params[3];
				
				var put_val = this.put_value(req);
				
				/**
				 * convert prop to nginx.conf and save
				 * */
				//if(cfg[index][prop]){
				//if property is found, check that put_val doens't include it
				put_val = (put_val[prop]) ? put_val[prop] : put_val;
				//}
				
				var value = {};
				value[prop] = put_val;
				
				console.log(cfg);
				console.log(value);
				
				cfg[index] = this.cfg_merge(cfg[index], value);
				
				var conf = this.obj_to_conf(cfg[index], function (conf){
					this.save(conf, read_vhosts[index]['file'], read_vhosts[index]['index']);
				}.bind(this));
				
				res.json(value);
			}
		}.bind(this);
		
		this.addEvent(this.ON_VHOST_INDEX_PROP_FOUND, save_index_property);
		this.addEvent(this.ON_VHOST_INDEX_PROP_NOT_FOUND, save_index_property);
		
		
		this.addEvent(this.ON_VHOST_INDEX_FOUND, function(req, res, next, params){
			if(req.method == 'PUT'){
				console.log('PUT: ON_VHOST_INDEX_FOUND');
				var cfg = params[0];
				var index = params[1];
				var read_vhosts = params[2];
				
				/**
				 * convert prop to nginx.conf and save
				 * */
				cfg[index] = this.cfg_merge(cfg[index], this.put_value(req));
				
				var conf = this.obj_to_conf(cfg[index], function (conf){
					this.save(conf, read_vhosts[index]['file'], read_vhosts[index]['index']);
				}.bind(this));
				
				res.json(cfg[index]);
			}
		}.bind(this));
		
		var save_property = function(req, res, next, params){
			console.log('PUT: ON_VHOST_PROP_FOUND || ON_VHOST_PROP_NOT_FOUND');
			if(req.method == 'PUT'){
				var cfg = params[0];
				var props = params[1];
				var prop = params[2];
				var read_vhosts = params[3];
				
				var props = [];
				var put_val = this.put_value(req);
				
				if(cfg instanceof Array){
					Array.each(cfg, function(vhost, index){
						
						/**
						 * convert prop to nginx.conf and save
						 * */
						 //if(vhost[prop]){
						 //if property is found, check that put_val doens't include it
						 put_val = (put_val[prop]) ? put_val[prop] : put_val;
						 //}
						 
						var value = {};
						value[prop] = put_val;
						
						vhost = this.cfg_merge(vhost, value)
						
						var conf = this.obj_to_conf(vhost,  function (conf){
							this.save(conf, read_vhosts[index]['file'], read_vhosts[index]['index']);
						}.bind(this));
						
						props[index] = value;
						
					}.bind(this));
			
					res.json(props);
				}
				else{
					/**
					 * convert prop to nginx.conf and save
					 * */
					 
					//if(cfg[prop]){
					//if property is found, check that put_val doens't include it
					put_val = (put_val[prop]) ? put_val[prop] : put_val;
					//}
					
					var value = {};
					value[prop] = put_val;
					
					cfg = this.cfg_merge(cfg, value);
					
					var conf = this.obj_to_conf(cfg,  function (conf){
						this.save(conf, read_vhosts['file'], read_vhosts['index']);
					}.bind(this));
					
					res.json(value);
				}
			}
		}.bind(this);
		
		this.addEvent(this.ON_VHOST_PROP_FOUND, save_property);
		this.addEvent(this.ON_VHOST_PROP_NOT_FOUND, save_property);
		
		this.addEvent(this.ON_VHOST_FOUND, function(req, res, next, params){
			if(req.method == 'PUT'){
				console.log('PUT: ON_VHOST_FOUND');
				var cfg = params[0];
				var read_vhosts = params[1];
				
				var vhosts = [];
				var put_val = this.put_value(req);
				
				if(cfg instanceof Array){
					
					Array.each(cfg, function(vhost, index){
						/**
						 * convert prop to nginx.conf and save
						 * */
						if(!put_val['_value']){
							cfg[index] = this.cfg_merge(cfg[index], put_val)
							var conf = this.obj_to_conf(cfg[index],  function (conf){
								this.save(conf, read_vhosts[index]['file'], read_vhosts[index]['index']);
							}.bind(this));
							
							vhosts.push(cfg[index]);
						}
					}.bind(this));
					
					if(vhosts.length == 0){
						res.status(500).json({error: 'Bad formated property value', value: put_val});
					}
					else{
						res.json(vhosts);
					}
				}
				else{
					/**
					 * convert prop to nginx.conf and save
					 * */
					
					if(put_val['_value']){
						res.status(500).json({error: 'Bad formated property value', value: put_val});
					}
					else{
						cfg = this.cfg_merge(cfg, put_val);
						
						var conf = this.obj_to_conf(cfg,  function (conf){
							this.save(conf, read_vhosts['file'], read_vhosts['index']);
						}.bind(this));
						
						res.json(cfg);
					}
				}
			}
		}.bind(this));
		/**
		 * 
		 * */
		 
		this.profile('nginx_vhosts_init');//end profiling
		
		this.log('nginx_vhosts', 'info', 'nginx_vhosts started');
  },
  put_value: function(req){
		var put_val = null;//value to PUT on property
		if(req.body['value'] || req.body['_value']){
			put_val = (req.body['value']) ? req.body['value'] : req.body['_value'];
		}
		else{
			put_val = req.body;
		}
		
		return put_val;
	},
  save: function(conf, file, index){
		var original_file = path.posix.basename(file);
		var original_path = path.dirname(file);
		var lock = os.tmpdir()+ '/.' + original_file + '.lock';
		
		//test
		//file = os.tmpdir()+ '/.' + original_file + '_' + new Date().getTime();
		
				
		fs.open(file, 'wx', (err, fd) => {
		
			lockFile.lock(lock, {wait: 1000} ,function (lock_err) {
				
				if(lock_err)
					throw lock_err;
					
		
				if (err) {
					if(err.code === 'EEXIST'){
						//console.log('exists....');
						//console.log(conf.nginx.server);
						
							//var server = null;
							
							nginx.create(file, function(err, original_conf) {
								if (err) {
									//console.log(err);
									return;
								}
								
								//don't write to disk when something changes 
								conf.die(file);
								
								if(original_conf.nginx.server){
									
									if(original_conf.nginx.server instanceof Array){
										//console.log('original_conf.nginx.server instanceof Array');
										if(original_conf.nginx.server[index]){
											original_conf.nginx.server[index] = conf.nginx.server;
										}
										else{
											throw new Errro('Bad index, somthing went wrong!');
										}
									}
									else{
										//console.log('original_conf.nginx.server NO Array');
										
										if(index == 0){
											original_conf.nginx.server = conf.nginx.server;
										}
										else{
											original_conf.nginx._add('server');
											original_conf.nginx.server[1] = conf.nginx.server;
										}
										
									}
									
									original_conf.flush();
								}
								else{
									//console.log(original_conf.nginx);
									throw new Error('case where vhosts are on original_conf.nginx.http....');
								}
								
							});
							
						
					}
					else{
						throw err;
					}
				}
				else{//if no exist, it's safe to write
					fs.close(fd);
					
					fs.writeFile(file, '', (err) => {//create empty
						
								conf.live(file);
								conf.flush();
								
					});
					
					
				}

			lockFile.unlock(lock, function (lock_err) {
					if(lock_err)
					throw lock_err;
					
				});
			});
			
		});//open
		
	},
  /**
   * @protected
   * */
	/**
	 * sync = available || enbaled
	 * */
	sync_vhosts: function(sync, callback){
		
		if(this.options.conf_path[sync] instanceof Array){
			var vhosts = [];
			
			var tmp = [];
			Array.each(this.options.conf_path[sync], function(dir, index){
				
				this.scan_vhosts(
					dir,
					this.options.conf_ext[sync],
					function(cfg){
						
						vhosts = vhosts.concat(cfg);
						
						tmp.push(dir);

						if(tmp.length == this.options.conf_path[sync].length){

							callback(vhosts);
						
						}
					}.bind(this)
				);
				
					
			}.bind(this));
			
		}
		else{
			////console.log(this.options.conf_path[sync]);
			this.scan_vhosts(
				this.options.conf_path[sync],
				this.options.conf_ext[sync],
				callback
			);
		}
	},
	scan_vhosts: function(conf_path, ext, callback){
		
		//console.log('----conf_path---');
		//console.log(conf_path);
		
		//try{
		if(fs.statSync(conf_path).isDirectory() == true){
			
			var files = fs.readdirSync(conf_path);
			var vhosts_full_conf_path = [];
			
			////console.log('----FILES-----');
			////console.log(files);
			
			if(files.length > 0){
				
				files.sort();//ensure always the same order
				
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
						//console.log('---full_conf_path---');
						//console.log(full_conf_path);
						
						vhosts_full_conf_path.push(full_conf_path);
						
						
					}
					
					if(index == files.length - 1){
						//console.log('----this.read_vhosts_simple----');
						//console.log(full_conf_path);
						this.read_vhosts_simple(vhosts_full_conf_path, function(cfg){
							
							callback(cfg);
						});
						
					}
					//else{
						//if(index == files.length - 1){
							//callback(vhosts);
						//}
					//}
					
				}.bind(this));
			}
			else{
				callback([]);
			}
		}
		else if(fs.statSync(conf_path).isFile() == true){
			this.read_vhosts_simple(full_conf_path, callback);
		}
		//}
		//catch(e){
		//}
	},
	read_vhosts_simple: function(files, callback){
		var vhosts = [];
		
		if(files instanceof Array){
			var tmp_cfg = [];
			var tmp_files = [];
			
			files.sort();//ensure always the same order
			
			Array.each(files, function(file, index){
				
				this.read_vhosts_simple(file, function(cfg){
					////console.log('---recursive----');
					
					
					tmp_cfg = tmp_cfg.concat(cfg);
					
					tmp_files.push(file);
					
					////console.log('----tmp_cfg-----');
					////console.log(tmp_cfg);
					
					//if(index == files.length - 1){
					if(tmp_files.length == files.length){
						//console.log(cfg);
						callback(tmp_cfg);
					}
				});
				
			}.bind(this));
			
		}
		else{
			var file = files;
			nginx.create(file, function(err, conf) {
				if (err) {
					//console.log(err);
					return;
				}
			 
				//don't write to disk when something changes 
				conf.die(file);
				
				var all_uris = [];
				
				if(conf.nginx.server instanceof Array){
					Array.each(conf.nginx.server, function(server, index){
						all_uris = server.server_name._value.clean().split(" ");
						
						Array.each(all_uris, function(uri){
							
							vhosts.push({
								uri: uri,
								file: file,
								index: index
							});
							
						});

					});
				}
				else{
					all_uris = conf.nginx.server.server_name._value.clean().split(" ");
					
					Array.each(all_uris, function(uri){
							
						vhosts.push({
							uri: uri,
							file: file,
							index: 0
						});
						
					});

				}
				
				callback(vhosts);
				
			}.bind(this));
		}
	},
	read_vhosts_full: function(vhosts, callback){
		var cfg = null;
		
					
		if(vhosts instanceof Array){
			var tmp_cfg = [];
			
			//for(var i = 0; i < vhosts.length; i++){
				//var vhost = vhosts[i];
				
				//this.read_vhosts_full(vhost, function(cfg){
					////console.log('---recursive----');
					////console.log(i);
					
					//tmp_cfg = tmp_cfg.concat(cfg);
					
					//if(i == vhosts.length){
						//callback(tmp_cfg);
					//}
				//});
			//}
			
			//Array.each(vhosts, function(vhost, i){
			//var not_full_array = true;
			
			for(var i = 0; i < vhosts.length; i++){
				var vhost = vhosts[i];
				
				this.read_vhosts_full(vhost, function(cfg, vhost){
					
					////console.log(recursive_index);
					
					
					var index = vhosts.indexOf(vhost);
					//console.log('---recursive----');
					//console.log(vhost);
					//console.log(index);
					
					//tmp_cfg = tmp_cfg.concat(cfg);
					tmp_cfg[index] = Object.clone(cfg);
					
					//console.log(tmp_cfg);
					
					//not_full_array = tmp_cfg.contains(undefined);
					
					if(tmp_cfg.clean().length == vhosts.length){
						
						
						////console.log(tmp_cfg);
						callback(tmp_cfg);
					}
				});
			}	
			//}.bind(this));
			
		}
		else{
			var file = vhosts.file;
			var vhost = vhosts.uri;
			var index = vhosts.index;
			
			nginx.create(file, function(err, conf) {
				if (err) {
					//console.log(err);
					return;
				}
			 
				//don't write to disk when something changes 
				conf.die(file);
				
				////console.log('read_vhost');
				////console.log(conf.nginx.server);
				
				//Array.each(conf.nginx.server, function(server){
					////console.log(server.server_name._value.clean().split(" "));
				//});
				
				var all_uris = [];
				
				if(conf.nginx.server instanceof Array && index == undefined){
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
					if(conf.nginx.server instanceof Array){
						var server = (index != undefined) ? conf.nginx.server[index] : conf.nginx.server;
					}
					else{
						var server = conf.nginx.server;
					}
						
					all_uris = server.server_name._value.clean().split(" ");
					
					
					Array.each(all_uris, function(uri){
							
						if(vhost == uri){
							cfg = this.conf_to_obj(server);
						}
						
					}.bind(this));
					
					//console.log('---NO ARRAY----');
					//console.log(server.server_name._value);
				}
				
				////console.log(cfg);
				callback(cfg, vhosts);
				
			}.bind(this));
			
		}	//else
		
	},
  conf_to_obj: function(conf){
		////console.log('---conf_to_obj----');
		////console.log(conf);
		
		var cfg = {};
		Object.each(conf, function(value, prop){
			////console.log('prop: '+prop);
			if(prop.charAt(0) != '_' && prop != 'toString'){
				////console.log('prop: '+prop);
				////console.log('value: '+value._comments);
				
				if(value instanceof Array){
					cfg[prop] = [];
					
					Array.each(value, function(val){
						
						//cfg[prop].push(val._value);
						var propertys = this.conf_to_obj(val);
						
						if(Object.getLength(propertys) > 0){
							var obj = {
								'_value' : val._value
							};
							
							if(val._comments && this.comments)
								obj['_comments'] = val._comments;
							
							cfg[prop].push(
								Object.merge(
									obj,
									propertys
								)
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
					var propertys = this.conf_to_obj(value);
					
					////console.log(propertys);
					
					//if(Object.getLength(propertys) > 0){
						cfg[prop] = Object.merge({
							'_value' : value._value
						},
						propertys);
						
						if(this.comments && value._comments && value._comments.length > 0)//if there are comments, attach it
							cfg[prop]['_comments'] = value._comments;
							
						if(Object.getLength(cfg[prop]) == 1)//if there are no other keys, except "_value", return it as property = value
							cfg[prop] = cfg[prop]['_value'];
						
					//}
					//else{
						//cfg[prop] = value._value;
					//}
					
					////console.log(this.conf_to_obj(value));
				}
			}
			
		}.bind(this));
		
		return cfg;
	},
	
	obj_to_conf: function(obj, callback){
		
		//console.log('obj_to_conf');
		//console.log(obj);
		
		fs.writeFile(os.tmpdir()+'/nginx-conf', '', (err) => {
			if (err) throw err;
			
			nginx.create(os.tmpdir()+'/nginx-conf', function(err, conf) {
				if (err) {
					//console.log(err);
					return;
				}
				
				conf.die(os.tmpdir()+'/nginx-conf');
				
				////console.log(conf.toString());
				conf.nginx._add('server');
				
				Object.each(obj, function(value, prop){
					////console.log('prop: '+prop);
					////console.log(value);
					
					if(value instanceof Array){
						Array.each(value, function(val, index){
							
							
							if(val instanceof Object){//ex: 'location' Array
								
								conf.nginx.server._add(prop, val['_value']);//add, ex: "location /"
								
								if(this.comments && val['_comments']){
									Object.each(val['_comments'], function(comment){
										if(conf.nginx.server[prop] instanceof Array){//if we added the key before, now is an array ex: multiple "location"
											var last = conf.nginx.server[prop].length - 1;
											conf.nginx.server[prop][last]._comments.push(comment);
										}
										else{
											conf.nginx.server[prop]._comments.push(comment);
										}
									});
								}
								 
								Object.each(val, function(item, key){//add, ex: "location / {proxy_pass: "$proxy"}"
									
									if(key != '_value' && key != '_comments'){
										if(conf.nginx.server[prop] instanceof Array){//if we added the key before, now is an array ex: multiple "location"
											var last = conf.nginx.server[prop].length - 1;
											conf.nginx.server[prop][last]._add(key, item);
										}
										else{
											conf.nginx.server[prop]._add(key, item);
										}
									}
									
								});
								
							}
							else{
								conf.nginx.server._add(prop, val);
							}
						}.bind(this));
					}
					else if(value instanceof Object){
						conf.nginx.server._add(prop);
						
						Object.each(value, function(val, key){
							if(key == '_value'){
								conf.nginx.server[prop]._value = val;
							}
							else if(key == '_comments' && this.comments){
								Array.each(val, function(comment){
									conf.nginx.server[prop]._comments.push(comment);
								});
							}
							else{
								conf.nginx.server[prop]._add(key, val);
							}	
						}.bind(this));
					}
					else{
						if(prop == '_value'){
							conf.nginx.server._value = value;
						}
						else if(prop == '_comments' && this.comments){
							conf.nginx.server._comments = value;
						}
						else{
							conf.nginx.server._add(prop, value);
						}
					}
				}.bind(this));
				
				////console.log(conf);
				
				callback(conf);
			}.bind(this));
			
		});

		

	},
	/**
	* change "location /" on Array: location[][_value]=/&location[][limit_req]=zone=default burst=5
	* , and with a comment: location[][_value]=/&location[][limit_req]=zone=default burst=5&location[][_comments][]=a comment
	* add "location /colo" on Array: location[][_value]=/colo&location[][limit_req]=zone=default burst=5
	* change include Array order: include[1]=/etc/nginx/conf.d/no_log.conf&include[0]=/etc/nginx/conf.d/errors.conf
	* convert "set" to Array: set[]=$proxy "http://educativa"&set[]=$bar "foo"
	* convert "if" Object to Array: if[][_value]=BAR&if[][rewrite]=FOO
	* delete "location": location=
	*/ 
	cfg_merge: function(orig, cfg){
		//var config = {};
		
		//config = Object.merge(orig, cfg);
		Object.each(cfg, function(value, prop){
			if(!orig[prop] && (!value || value == '')){//if property doesn't exist and value not empty or undefined, add it
				orig[prop] = value;
			}
			else{
				if(!value || value == '' || value == null){//if value empty or undefined, delete it
					delete orig[prop];
				}
				else if(value instanceof Array){
					
					if (orig[prop] instanceof Array){//if original it's also an Array
						
						var found = false;
						
						/**
						 * check what type of data it is:
						 * simple as include: [file, file2, fileN]
						 * complex as location: [{ _value: '/', proxy_pass: '$proxy' }]
						 * */
						Array.each(value, function(inside_val, inside_key){
							if(inside_val['_value']){
								/**
								 * if it's and object (ex: location: { _value: '/' }), we need to search it inside original
								 * */
								Array.each(orig[prop], function(orig_val, orig_key){
									
									if(orig_val['_value'] && (orig_val['_value'] == inside_val['_value'])){//match, replace it
										found = true;
										
										if(!inside_val || inside_val == '' || inside_val == null){//if value empty or undefined, delete it
											delete orig[prop][orig_key];
										}
										else{
											orig[prop][orig_key] = inside_val;
										}
									}
									
								});
								
								if(!found && (!inside_val || inside_val == ''))//no match, push it (unless no inside_val)
									orig[prop].push(inside_val);
									
							}
							else{//simple values (ex: include[file, file2, fileN])
								if(!inside_val || inside_val == '' || inside_val == null){//if value empty or undefined, delete it
									delete orig[prop][inside_key];
								}
								else{
									orig[prop][inside_key] = inside_val;
								}
								//orig[prop][inside_key] = inside_val;
							}
						});
					}
					else if (orig[prop] instanceof Object){//if original it's an Object, convert it to an array, saving orginal value
						var tmp_val = orig[prop];
						orig[prop] = value;
						orig[prop].unshift(tmp_val);
					}
					else{//if original not Array, just replace it
						orig[prop] = value;
					}
				}
				//else if(value instanceof Object){
					//if (orig[prop] instanceof Object){//if original it's also an Object
					//}
					//else{//if original not Object, just replace it
						//orig[prop] = value;
					//}
				//}
				else{//simple values
					orig[prop] = value;
				}
				
			}
			
		});
		
		//Object.each(cfg, function(value, prop){
			//if(!value || value == '')
				//delete orig[prop];
				////delete cfg[prop];
		//});
		
		
		return orig;
	},
	/**
	 * return just 1 match of vhosts, even if it is multiple times in a file, 
	 * vhosts: {uri, file}
	 * uri: vhost to search
	 * */
	search_unique_vhost: function(vhosts, uri){
		var tmp_files = [];//keep track of wich files were already included
		var read_vhosts = [];
		
		for(var i = 0; i < vhosts.length; i++){//search uri on all vhosts, there may be multiple matchs on same or diferent files
			
			if(vhosts[i].uri == uri){//found
				
				if(tmp_files.indexOf(vhosts[i].file) == -1){//if file was not include already, include {uri, file}
					read_vhosts.push(vhosts[i]);
				}
				
				tmp_files.push(vhosts[i].file);
			}
				
		}
		
		return read_vhosts;
	},
	/**
	 * return every match of vhost
	 * vhosts: {uri, file}
	 * uri: vhost to search
	 * */
	search_vhost: function(vhosts, uri){
		var read_vhosts = [];
		
		for(var i = 0; i < vhosts.length; i++){//search uri on all vhosts, there may be multiple matchs on same or diferent files
			
			if(vhosts[i].uri == uri){//found
				read_vhosts.push(vhosts[i]);
			}
				
		}
		
		return read_vhosts;
	},
});
