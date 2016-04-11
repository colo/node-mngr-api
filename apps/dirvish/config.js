'use strict'

var App = require('node-express-app'),
	path = require('path'),
	Q = require('q');
	
const readline = require('readline'),
			fs = require('fs');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  files: ["../../devel/etc/dirvish.conf", "../../devel/etc/dirvish/master.conf"],
  config: {},
  
  
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
		
		//console.log('dirvish config');
		//console.log(this.config);
		
		
		this.files.each(function(file, index){
			var file_path = path.join(__dirname, file);
			
			try{
				fs.accessSync(file_path, fs.R_OK);
				
				//this.config = this.parse_config(file_path);
				this.parse_config(file_path)
				.then(function(config){
					this.config = config;
					
					console.log('this.config');
					console.log(this.config);
				}.bind(this))
				.done();
				
				throw new Error('Read: '+ file_path);//break the each loop
			}
			catch(e){
				console.log(e);
			}
			
			
		}.bind(this));
		
		
		this.log('config', 'info', 'dirvish config started');
  },
  parse_config: function(file_path){
		var deferred = Q.defer();
		
		const rl = readline.createInterface({
			input: fs.createReadStream(file_path)
		});

		var comment = null;
		var key = null;
		var config = {};
		
		rl.on('line', function(line) {
			line = line.clean();
			//var key = null;
			
				
			if(line.indexOf('#') == 0){//comment
				comment = (comment == null) ? line : comment + "\n"+line;
				line = null;
			}
			else if(line.indexOf('#') > 0){//comment after line
				comment = line.slice(line.indexOf('#'), line.length -1);
				line = line.slice(0, line.indexOf('#') - 1);
				
			}

			
			if(line != null && line != ''){//avoid null lines
				
				if(line.indexOf(':') == line.length - 1){//if line ends with ':' starts a multiline section
					key = line.slice(0, line.indexOf(':')).clean();
					config[key] = [];
				}
				else if(line.indexOf(':') > 0){//section : value
					var tmp = line.split(':');
					key = tmp[0].clean();
					
					if(key == 'config'){//include config file
						
							
						if(!path.isAbsolute(tmp[1].clean())){//if file path is not absolute, make an array of possible path
							var vault_dir = '';//get vault dir
							var files = [
								vault_dir+'/'+tmp[1].clean(),
								vault_dir+'/'+tmp[1].clean()+'.conf',
								'../../devel/etc/dirvish/'+tmp[1].clean(),
								'../../devel/etc/dirvish/'+tmp[1].clean()+'.conf'
							];
						}
						
						files.each(function(file, index){
							var file_path = path.join(__dirname, file);
							
							try{	
								fs.accessSync(file_path, fs.R_OK);
								
								//this.config = this.parse_config(file_path);
								this.parse_config(file_path)
								.then(function(cfg){
									config['config'] = cfg;
									
									//console.log('config[key]'+key);
									//console.log(config);
									
								}.bind(this))
								.done();
								
								throw new Error('Read: '+ file_path);//break the each loop
							}
							catch(e){
								console.log(e);
							}
						
						}.bind(this));
						
					}
					else{
						config[key] = tmp[1].clean();
					}
					
					key = null;
				}
				else if(/SET|UNSET|RESET/.test(line)){//the onlye 3 options that don't use colons <:>

					var tmp = line.split(' ');
					console.log(tmp);
					key = tmp[0].clean();
					config[key] = [];
					
					for(var i = 1; i < tmp.length; i++){
						config[key].push(tmp[i].clean());
					}
					key = null;
				}
				else{//value of a multiline section
					config[key].push(line.clean());
				}
				
				//console.log('Comment from file:', comment);
				//console.log('Line from file:', line);
				
			}
		}.bind(this));
		
		rl.on('close', function(){
				console.log('dirvish config');
				console.log(config);
				
				deferred.resolve(config);
		});
		
		return deferred.promise;
	}
  
});

