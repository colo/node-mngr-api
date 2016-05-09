//'use strict'

var App = require('node-express-app'),
	fs = require('fs'),
	path = require('path');
	
	//zonefile = require('dns-zonefile'); not working....colliding with mootools??

//command line zonefile works
var sys = require('sys'),
	exec = require('child_process').exec,
	zonefile = path.join(__dirname,'./node_modules/dns-zonefile/bin/zonefile');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	
	zones_dir: path.join(__dirname,'./../../devel/var/bind/domains'),
	zone_file_filter: /^[a-zA-Z0-9_\.-]+$/,
	zone_file_extension: '.hosts',
	
	id: 'bind',
	path: '/bind/zones',
	
	//authorization: {
		//config: path.join(__dirname,'./config/rbac.json'),
	//},
	
	params: {
	  zone: /^[a-zA-Z0-9_\.-]+$/,
	  prop: /origin|ttl|ns|a|aaaa|cname|mx|txt|srv/,
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
				path: ':zone',
				callbacks: ['get_zone'],
				version: '',
			  },
			  {
				path: ':zone/:prop',
				callbacks: ['get_zone'],
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
  get_zone: function (req, res, next){
	
	if(req.params.zone){
		var full_path = path.join(this.options.zones_dir, req.params.zone + this.options.zone_file_extension);
		
		try{
			if(fs.statSync(full_path).isFile()){
				//console.log('get_zone');
				//console.log(req.params.zone);
				//console.log(full_path);
				
				// executes `pwd`
				child = exec(zonefile + ' -p '+full_path, function (error, stdout, stderr) {
				  //sys.print('stdout: ' + stdout);
				  //sys.print('stderr: ' + stderr);
				  if (error !== null) {
					res.json({error: error});
				  }
				  
				  var json = JSON.decode(stdout);
				  
				  ////console.log('prop '+req.params.prop);
				  ////console.log(json);
				  
				  if(req.params.prop){
					if(!json[req.params.prop])
						json[req.params.prop] = {};
						
					res.json(json[req.params.prop]);
				  }
				  else{
					res.json(json);
				  }
					
				});
				//var text = fs.readFileSync(full_path, 'utf8');
				
				////console.log(text);
				
				
			}
		}
		catch (e){
			res.json(e);
		}
	  
	}
	else{  
		res.json({err: 'wrong zone param'});
	}
  },
  get: function (req, res, next){
	  
	  fs.readdir(this.options.zones_dir, function(err, files){
		  if(err){
			  res.json({err: err});
		  }
		  else{
			  var zones_files= [];
			  var count = 0;
			  files.forEach(function(file) {
				if(! (file.charAt(0) == '.')){//ommit 'hiden' files
				  
				  var full_path = path.join(this.options.zones_dir, file);
				  
				  if(fs.statSync(full_path).isFile() == true && this.options.zone_file_filter.exec(file) != null){
					  
					  if(this.options.zone_file_extension && path.extname(file) == this.options.zone_file_extension){
						file = file.replace(this.options.zone_file_extension, '');
						zones_files.push(file);
						//console.log('file: '+file);
					  }
					  else if(!this.options.zone_file_extension){
						zones_files.push(file);
						//console.log('file: '+file);
					  }
			
					  
					  
				  }
				  
				}
				
				
				
				if(count == files.length - 1 )
					res.json(zones_files);
					
				count++;
				
			  }.bind(this));
			  
			  
		  }
	  }.bind(this));
	  
  },
  initialize: function(options){
	
	this.parent(options);//override default options
	
	this.log('bind', 'info', 'bind started');
  },
	
});

