'use strict'

const Moo = require("mootools"),
		path = require("path"),
		BaseApp = require ('./base.conf');

var session = require('express-session'),
		MemoryStore = require('memorystore')(session), //https://www.npmjs.com/package/memorystore
		helmet = require('helmet'),
		winston = require('winston');

/**
 * Requiring `winston-logstash` will expose
 * `winston.transports.Logstash`
 * */
require('winston-logstash');
		
		//winstonKibana = require('winston-kibana');
		//Elasticsearch = require('winston-elasticsearch-js'),
		//es = require('elasticsearch');
		
//var esClient = new es.Client({
  //host: 'http://192.168.0.40:9200',
  ////log: 'trace'
//});

/*var session = require('express-session'),
		SQLiteStore = require('connect-sqlite3')(session);*/

var common = require('winston/lib/winston/common');


var trasnform = function (level, msg, meta, self) {
    return common.log({
        level: level,
        message: msg,
        node_name: self.node_name,
        meta: meta,
        timestamp: self.timestamp,
        json: true,
        label: self.label,
    });
};

module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		logs: {
			loggers: {
				error: null,
				access: null,
				profiling: null
			},
			
			path: './logs',
			
			//default: [
				//{ transport: 'console', options: { colorize: 'true', level: 'warning' } },
				//{ transport: 'logstash', options: {level: 'info', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' } }
			//]
			default: [
				{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				{ transport: winston.transports.Logstash, options: {transform: trasnform, level: 'info', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' } }
			]
		},
		
		authentication: {
			users : [
				{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
				//{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
				/**
				 * *curl -H "Content-Type:application/json" -H "Accept:application/json" -H "Authorization: Basic bGJ1ZW5vOjEyMw==" http://localhost:8081/
				 * */
				{ id: 2, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
				{ id: 3, username: 'test' , role: 'user', password: '123'}
			],
		},
		
	},
	initialize: function(options){
		
		//this.options.middlewares.unshift(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
		this.options.middlewares.unshift(helmet());
			
			//var logger = new winston.Logger({
				//level: 'info',
				//transports: [
					//new (winston.transports.Console)(),
				//]
			//});
			
			//logger.add(winston.transports.Logstash, {level: 'debug', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' });
			//winston.add(logger);
			
			//logger.log('debug', 'message');
			
			//winston.loggers.add('something', {
				//console: {level: 'debug'},
				//logstash : {level: 'debug', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' }
			//});
			
			////console.log(winston.loggers.get('something').transports);
			
			//winston.loggers.get('something').log('debug', 'message');
			
			//for(var i=0; i< 1000;i++){
				//winston.loggers.add('something'+i, {
					//console: {level: 'debug'},
					//logstash : {level: 'debug', port: 28777, node_name: 'mngr-api'+i, host: '192.168.0.40' }
				//});
				//winston.loggers.get('something'+i).log('debug', 'message');
			//}
		 
		//this.options.logs.default = new winston.Logger({
			//transports: [
				////new winston.transports.Console ( { colorize: 'true', level: 'warning' } )
				////winston.transports.Logstash({level: 'info', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' })
			//]
		//});
			
		this.options.session = session({
				store: new MemoryStore({
					checkPeriod: 3600000 // prune expired entries every hour
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: '19qX9cZ3yvjsMWRiZqOn',
				resave: true,
				saveUninitialized: false,
				name: 'mngr.api',
				unset: 'destroy'
		});
		
		/*this.options.session = session({
				store: new SQLiteStore ({
					dir: path.join(__dirname,'../devel/var/lib/mngr-api/'),
					db: 'sessions.db'
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: 'keyboard cat',
				resave: true,
				saveUninitialized: true
		});*/
			
		if(process.env.NODE_ENV === 'production'){
			/**
			 * add 'check_authentication' & 'check_authorization' to each route
			 * */
			Object.each(this.options.api.routes, function(routes, verb){
				
				if(verb != 'all'){
					Array.each(routes, function(route){
						//debug('route: ' + verb);
						route.callbacks.unshift('check_authorization');
						route.callbacks.unshift('check_authentication');
						
						if(verb == 'get')//users can "read" info
							route.roles = ['user']
					});
				}
				
			});
		}
		
		this.parent(options);//override default options
		
		
	}
	
});
