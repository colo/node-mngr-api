'use strict'

var options = {
	authentication: {
		users : [
			  { id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
			  { id: 2, username: 'test' , role: 'user', password: '123'}
		],
	},
}

/**
 * minumun requirement
 * 
 * */
var path = require('path'),
	apps = require('node-express-autoload').load(path.join(__dirname, '/apps'), options);

var root = null;

/**
 * find root app
 * 
 * */
Object.each(apps, function(app, id){
	if(app['mount'] == '/')
		root = app;
		
})

/**
 * configure root app, every other will inherit
 * 
 * */
var serveIndex = require('serve-index'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser');
	
if(root){
	// parse application/x-www-form-urlencoded
	root.app.use(bodyParser.urlencoded({ extended: false }))

	// parse application/json
	root.app.use(bodyParser.json())
	  
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
