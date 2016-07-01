'use strict'

var App = require('node-express-app'),
	path = require('path'),
	fs = require('fs'),
	BlockDevice = require('blockdevice');
	
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  devices: {},
  options: {
	  
		id: 'blockdevices',
		path: '/os/blockdevices',
		
		//scan_dirs: ['/dev/', '/dev/vol0'],
		//scan: /^(hd|sd|xvd)([^0-9]*)$/,
		scan: /hd|sd|xvd/,
		//([^0-9]*)
		
		//authorization: {
			//config: path.join(__dirname,'./config/rbac.json'),
		//},
		
		params: {
			device: /^\w+$/,
			prop: /size|blockSize|partitions/
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
						path: ':device',
						callbacks: ['get'],
						version: '',
						},
					{
					path: ':device/:prop',
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
  
  get: function (req, res, next){
		if(req.params.device){
			
			if(!this.devices[req.params.device]){
				res.status(500).json({error: 'Wrong device'});
			}
			
			if(req.params.prop){
				if(!this.devices[req.params.device][req.params.prop]){
					res.status(500).json({error: 'Wrong property'});
				}
				else{
					res.json(this.devices[req.params.device][req.params.prop]);
				}
			}
			else{
				res.json(this.devices[req.params.device]);
			}
		}
		else{
			res.json(this.devices);
		}
  },
  initialize: function(options){
		
		this.parent(options);//override default options
		
		fs.readdir('/dev', function(err, files){
			if( err != null )
				throw err;
					
			//console.log(files);
			Array.each(files, function(file){
				
				if(this.options.scan.test(file)){
					
					//this.devices[file] = {};
					
					var device = new BlockDevice({
						path: '/dev/'+file,
						// also, we only want to read
						mode: 'r',
					});
					
					device.open( function( error ) {
						
						var info = {};
						
						// You should do proper error handling
						// here, but for the sake of simplicity
						// in an example, we'll just throw
						if( error != null )
							throw error;
							
						device.detectSize( null, function( err, size ){
							if( err != null )
								throw err;
								
							//console.log('size: ' + size);
							info['size'] = size;
						
							info['blockSize'] = device.blockSize;
						
							if(/([0-9])+$/.test(file)){//partition number
								//console.log('block device string: '+/[A-Za-z]*/.exec(file));
								//console.log('block device: '+file);
								
								var disk = /[A-Za-z]*/.exec(file);//return string device only
								//this.devices[disk]['partitions'] = {};
								if(!this.devices[disk]){
									this.devices[disk] = {};
								}
								//console.log(this.devices);
								if(!this.devices[disk]['partitions'])
									this.devices[disk]['partitions'] = {};
									
								this.devices[disk]['partitions'][file] = info;
							}
							else{
								info.partitions = {};
								if(!this.devices[file])
									this.devices[file] = {};
									
								this.devices[file] = Object.merge(this.devices[file], info);
							}
						}.bind(this));
						
						
						
					}.bind(this));
					
					device.close(function( err ){ if( err != null ) throw err; });
				}
				
			}.bind(this));
		}.bind(this));
		
		this.log('os-blockdevices', 'info', 'os-blockdevices started');
  },
	
});

