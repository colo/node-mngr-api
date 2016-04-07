'use strict'

var App = require('node-express-app'),
	path = require('path'),
	os = require('os'),
	exec = require('child_process').exec,
	Q = require('q');
	


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
		this._networkInterfaces()
		.then(function(ifaces){
			//console.log('result');
			//console.log(ifaces);
			
			var json = {};
			Object.each(os, function(item, key){
				console.log('OS.'+key);
				//console.log('OS.'+item);
				if(key != 'getNetworkInterfaces' && key != 'networkInterfaces')//deprecated func && use internal func
					json[key] = (typeof(item) == 'function') ? os[key]() : os[key];
				
				if(key == 'networkInterfaces'){
					json[key] = ifaces;
				}
				
			}.bind(this));
			
			//console.log('OS.'+json);
			res.json(json);
		})
		.done();
		
	  
  },
  _networkInterfaces: function(){
		var deferred = Q.defer();
		var ifaces = os.networkInterfaces();
		
		console.log(ifaces);
		
		var child = exec(
			'cat /proc/net/dev',
			function (err, stdout, stderr) {
				
				if (err) deferred.reject(err);
				
				var data = stdout.split('\n');

				data.splice(0, 2);
				data.splice(-1, 1);
				
				data.each(function(item, index){
					console.log('iface item '+item);
					//if(index != 0 && index != data.length -1 ){
						//console.log(item.clean().split(' '));
						var tmp = item.clean().split(' ');
						tmp[0] = tmp[0].replace(':', ''); //removes : from iface name
						var name = tmp[0];
						console.log(tmp);
						
						if(ifaces[name]){
							var tmp_data = ifaces[name];
							
							ifaces[name] = {
								'if' : tmp_data,
								'recived' : {
									bytes : tmp[1],
									packets : tmp[2],
									errs : tmp[3],
									drop : tmp[4],
									fifo : tmp[5],
									frame : tmp[6],
									compressed : tmp[7],
									multicast : tmp[8]
								},
								'transmited': {
									bytes : tmp[9],
									packets : tmp[10],
									errs : tmp[11],
									drop : tmp[12],
									fifo : tmp[13],
									colls : tmp[14],
									carrier : tmp[15],
									compressed : tmp[16]
								}
							};
							
							
							
						}
				}.bind(this));
				
				deferred.resolve(ifaces);
			}.bind(this)
		);
		
	
    return deferred.promise;  
  },
  initialize: function(options){
	
		//dynamically create routes based on OS module (ex: /os/hostname|/os/cpus|...)
		Object.each(os, function(item, key){
			if(key != 'getNetworkInterfaces'){//deprecated func
				var callbacks = [];
			
				if(key == 'networkInterfaces'){//use internal func
					this[key] = function(req, res, next){
						this._networkInterfaces()
						.then(function(ifaces){
							console.log('ifaces');
							console.log(ifaces);
							
							res.json(ifaces);
						})
						.done();
					}
				}
				else{
					this[key] = function(req, res, next){
						res.json((typeof(item) == 'function') ? os[key]() : os[key]);
					}
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

