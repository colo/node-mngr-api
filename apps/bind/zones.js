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
  /**
	 * first precedence param
	 * @first: return first entry
	 * @first=n: return first N entries (ex: ?first=7, first 7 entries)
	 * 
	 * second precedence param
	 * @last: return last entry 
	 * @last=n: return last N entries (ex: ?last=7, last 7 entries)
	 * 
	 * third precedence params
	 * @start=n: return from N entry to last or @end (ex: ?start=0, return all entries)
	 * @end=n: set last N entry for @start (ex: ?start=0&end=9, return first 10 entries)
	 * */
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
					
					
					//res.status(201).links({ next: req.protocol+'://'+req.hostname+':8080/'}).json({'status': 'ok'});
					
					if(count == files.length - 1 ){//finish loading files
						
						var URI = req.protocol+'://'+req.hostname+':'+process.env.PORT+this.express().mountpath+'/';
						
						var status = 206; //206 partial list | 200 full list
						
						var result = [];
						var links = {};
						links.first = URI+'?first';
						links.last = URI+'?last';
						
						links.next = null;
						links.prev = null;
						
						var range_start = 0;
						var range_end = 0;
						
						if(req.query.first != undefined){
							
							
							//console.log(req.baseUrl);
							//console.log(this.express().mountpath);
							
							if(req.query.first == '' || !(req.query.first > 0)){
								
								links.next = URI+'?start=1&end=2';
								links.prev = links.last;
								
								range_start = 0;
								range_end = 0;
						
								result.push(zones_files[0]);
								
								
							}
							else{
								var first = (new Number(req.query.first) < zones_files.length) ? new Number(req.query.first) : zones_files.length - 1;
								
								for(var i = 0; i <= first; i++){
									result[i] = zones_files[i];
								}
								
								var next = {};
								next.start = first;
								
								var next_end = next.start + next.start - 1;
								next.end = (next_end < zones_files.length) ? next_end : zones_files.length - 1;
								
								
								links.next = URI+'?start='+next.start+'&end='+next.end;
								links.prev = links.last+'='+req.query.first;
								
								range_start = 0;
								range_end = result.length - 1;
								
							}
						}
						else if(req.query.last != undefined){
							
							if(req.query.last == '' || !(req.query.last > 0)){
								//console.log('LAST');
								
								var prev = {};
								prev.start = prev.end = zones_files.length - 2;
								
								links.next = links.first;
								links.prev = URI+'?start='+prev.start+'&end='+prev.end;
								
								result.push(zones_files[zones_files.length - 1]);
								
								range_start = zones_files.length - 1;
								range_end = zones_files.length - 1;
								
							}
							else{
								var last = (new Number(req.query.last) < zones_files.length) ? new Number(req.query.last) : zones_files.length - 1;
								
								for(var i = zones_files.length - last; i <= zones_files.length - 1; i++){
									result.push(zones_files[i]);
								}
								
								var prev = {};
								prev.end = zones_files.length - last - 1 ;
								prev.start = ((prev.end - last + 1) > 0) ? (prev.end - last + 1) : 0;
								
								links.next = links.first+'='+last;
								links.prev = URI+'?start='+prev.start+'&end='+prev.end;
								
								range_start = zones_files.length - last;
								range_end = zones_files.length - 1;
								
							}
							
						}
						else if(req.query.start != undefined && req.query.start >= 0){
							var end = null;
							var start = (new Number(req.query.start) < zones_files.length) ? new Number(req.query.start) : zones_files.length - 1;
							
							if(req.query.end != undefined && new Number(req.query.end) >= start){
								end = (new Number(req.query.end) < zones_files.length) ? new Number(req.query.end) : zones_files.length -1;
							}
							else{
								end = zones_files.length - 1;
							}
							
							for(var i = start; i <= end; i++){
								result.push(zones_files[i]);
							}
							
							var next = {};
							next.start = ((end + 1) < zones_files.length) ? (end + 1) : 0;
							next.end = (next.start + (end - start) < zones_files.length) ? next.start + (end - start) : zones_files.length -1;
							
							var prev = {};
							prev.end = start - 1;
							prev.start = (prev.end - (end - start) > 0) ? prev.end - (end - start) : 0;
							
							
							links.next = URI+'?start='+next.start+'&end='+next.end;
							links.prev = URI+'?start='+prev.start+'&end='+prev.end;
							
							range_start = start;
							range_end = end;
						}
						else{
							
							links.next = links.last;
							links.prev = links.first;
							
							status = 200;
							result = zones_files;
						}
						
						if(status != 200){//set range Header
							res.set('Content-Range', range_start+'-'+range_end+'/'+zones_files.length);
						}
						
						res.status(status).links(links).json(result);
					}
						
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

