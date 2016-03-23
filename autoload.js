'use strict'

var fs = require('fs'),
		path = require('path');

var apps = {};

module.exports.load = function(wrk_dir, options){
	options = options || {};
	
	//console.log('load.options');
	//console.log(options);
	
	fs.readdirSync(wrk_dir).forEach(function(file) {

		var full_path = path.join(wrk_dir, file);
		
		
		if(! (file.charAt(0) == '.')){//ommit 'hiden' files
			//console.log('-------');
			
			//console.log('app load: '+ file);
			var app = null;
			var id = '';//app id
			var mount = '';
			
			if(fs.statSync(full_path).isDirectory() == true){//apps inside dir
				
				//console.log('dir app: '+full_path);
				
				var dir = file;//is dir
				
				fs.readdirSync(full_path).forEach(function(file) {//read each file in directory
					
					if(path.extname(file) == '.js' && ! (file.charAt(0) == '.')){
						
						//console.log('app load js: '+ file);
						app = require(path.join(full_path, file));
						
						if(file == 'index.js'){
							mount = id = dir;
						}
						else{
							id = dir+'.'+path.basename(file, '.js');
							mount = dir+'/'+path.basename(file, '.js');
						}
						
						if(typeOf(app) == 'class'){//mootools class
							//console.log('class app');
							
							var instance = new app(options);
							
							/*//console.log('mootols_app.params:');
							//console.log(Object.clone(instance.params));*/
							
							app = instance.express();
							id = (instance.id) ? instance.id : id;
							//apps[app.locals.id || id]['app'] = app;
						}
						else{//nodejs module
							//console.log('express app...nothing to do');
						}
						
						mount = '/'+mount;
						
						apps[app.locals.id || id] = {};
						apps[app.locals.id || id]['app'] = app;
						apps[app.locals.id || id]['mount'] = mount;
					}

				});//end load single JS files

			}
			else if(path.extname( file ) == '.js'){// single js apps
				//console.log('file app: '+full_path);
				//console.log('basename: '+path.basename(file, '.js'));
				
				app = require(full_path);
				id = path.basename(file, '.js');
				
				if(file == 'index.js'){
					mount = '/';
				}
				else{
					mount = '/'+id;
				}
				
				if(typeOf(app) == 'class'){//mootools class
					var instance = new app(options);
					app = instance.express();
					id = (instance.id) ? instance.id : id;
				}
				else{//nodejs module
					//console.log('express app...nothing to do');
				}
				
				
				apps[app.locals.id || id] = {};
				apps[app.locals.id || id]['app'] = app;
				apps[app.locals.id || id]['mount'] = mount;
			}
			
			
		}
	})
	
	return apps;
}

module.exports.apps = apps;
//module.exports.root = root;

 

