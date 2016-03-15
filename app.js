'use strict'

var fs = require('fs'),
	path = require('path'),
	serveIndex = require('serve-index'),
    serveStatic = require('serve-static');
	//express = require('express'),
	//serveStatic = require('serve-static');
	
/**
 * @autoload
 * 
 */
 
var apps = {};
var wrk_dir = path.join(__dirname, '/apps');//working dir
  
require("fs").readdirSync(wrk_dir).forEach(function(file) {

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
						
						var instance = new app();
						
						/*//console.log('mootols_app.params:');
						//console.log(Object.clone(instance.params));*/
						
						app = instance.express();
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
				var instance = new app();
				app = instance.express();
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

//Object.each(apps, function(app, id){
	//console.log('app id: '+id );
	////console.log('app mount: '+app.mount );
	//var tmp_app = null;
	//if(!app['app'].express){
		//tmp_app = app['app'];
	//}
	//else{
		//tmp_app = app['app'].express();
	//}
	
	//tmp_app.use('/public/apps/' + id, serveIndex(path.join(__dirname, '/apps/', id, '/assets'), {icons: true}));	
	//tmp_app.use('/public/apps/' + id, serveStatic(path.join(__dirname, '/apps/', id, '/assets')));
	
//})


/**
 * @automount
 * 
 */

var root = null;
 
Object.each(apps, function(app, id){
	if(app['mount'] == '/')
		root = app;
		
})


////console.log(root);

if(root){
	Object.each(apps, function(app, id){
		
		if(app['mount'] != root['mount']){
			root['app'].use(app['mount'], app['app']);
			//console.log('app[\'mount\']: '+app['mount']);
		}
		
		//var tmp_app = null;
		//if(!app['app'].express){
			//tmp_app = app['app'];
		//}
		//else{
			//tmp_app = app['app'].express();
		//}
		
		root.app.use('/public/apps/' + id, serveIndex(path.join(__dirname, '/apps/', id, '/assets'), {icons: true}));	
		root.app.use('/public/apps/' + id, serveStatic(path.join(__dirname, '/apps/', id, '/assets')));
	})
	
	root.app.use('/public', serveIndex(path.resolve('./public'), {icons: true}));
	root.app.use('/public', serveStatic(path.resolve('./public')));
}



////root.use('/', routes);
//apps['index'].use('/users', apps['users']);
//apps['index'].use('/admin', apps['admin']);

// catch 404 and forward to error handler
/*root.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (root.get('env') === 'development') {
  root.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
root.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/


module.exports = root['app'];
