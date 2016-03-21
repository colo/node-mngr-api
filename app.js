'use strict'

var path = require('path'),
	serveIndex = require('serve-index'),
	serveStatic = require('serve-static'),
  apps = require('node-express-autoload').load(path.join(__dirname, '/apps'));

	
var root = null;

/**
 * find root app
 * 
 * */
Object.each(apps, function(app, id){
	if(app['mount'] == '/')
		root = app;
		
})

if(root){
	Object.each(apps, function(app, id){
		
		if(app['mount'] != root['mount']){
			root['app'].use(app['mount'], app['app']);
			//console.log('app[\'mount\']: '+app['mount']);
		}
		
		root.app.use('/public/apps/' + id, serveIndex(path.join(__dirname, '/apps/', id, '/assets'), {icons: true}));	
		root.app.use('/public/apps/' + id, serveStatic(path.join(__dirname, '/apps/', id, '/assets')));
	})
	
	root.app.use('/public', serveIndex(path.resolve('./public'), {icons: true}));
	root.app.use('/public', serveStatic(path.resolve('./public')));
}

/**
 * export root express app
 * 
 * */
module.exports = root['app'];
