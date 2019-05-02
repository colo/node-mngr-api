'use strict'

/**
 * NODE_ENV=production
 * LOG_ENV=debug
 * PROFILING_ENV=true
 * */
const	path = require('path');
		//bodyParser = require('body-parser'),
		//multer = require('multer'), // v1.0.5
		//upload = multer(), // for parsing multipart/form-data
		//cors = require('cors');

const App =  process.env.NODE_ENV === 'production'
      ? require('./config/prod.conf')
      : require('./config/dev.conf');


	//AdminApp = require(path.join(__dirname,'apps/admin/'));




let MyApp = new Class({
  Extends: App,

	//get_app: function(req, res, next){
		//res.send('App');
  //},
  get: function(req, res, next){
		// console.log(this.authentication.store.users);
		// console.log(this.authentication.auth.users);

		res.json({ id: this.options.id });
  },

  initialize: function(options){

		//this.options.middlewares
		this.parent(options);//override default options

		//console.log(this.options.api.routes.all);

		//this.parent(config.options);//override default options

		this.profile('root_init');//start profiling

		/*this.authentication.addEvent(this.authentication.ON_AUTH, function(err, user){
			console.log('app.ON_AUTH');
			console.log(err);
			console.log(user);
		});*/
		/*------------------------------------------*/
		if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
			this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
				console.log('----this.authorization.NEW_SESSION----')
			//   //console.log('event');
			//   //console.log(obj);

			  if(!obj.error){

					/*this.authorization.processRules({
						"subjects": function(){
							if(obj.getID() == "test")
							return [{ "id": "test", "roles":["user"]}];

							if(obj.getID() == "lbueno")
							return [{ "id": "lbueno", "roles":["admin"]}];
						},
					});*/
			  }

			}.bind(this));
		}

		//this.express().use(bodyParser.json()); // for parsing application/json
		//this.express().use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

		//this.express().use(cors(this.options.cors));

		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
		//this.log('root', 'error', 'ERROR');

		this.express().set('authentication',this.authentication);
  },


});

let root = new MyApp();
root.addEvent(root.ON_INIT, root.load(path.join(__dirname, '/apps')));

//root.load(path.join(__dirname, '/apps'));
//let test = new MyApp();
//let admin = new AdminApp();

//root.use('/test', test);
//root.use('/admin', admin);

module.exports = root.express();
