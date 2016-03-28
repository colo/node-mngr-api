'use strict'

var App = require('node-express-app'),
	path = require('path'),
	passwd = require('etc-passwd');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
	id: 'groups',
	path: '/os/groups',
	
	//authorization: {
		//config: path.join(__dirname,'./config/rbac.json'),
	//},
	
	params: {
	  uid: /^\w+$/,
	  prop: /groupname|password|gid|users/
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
				path: ':gid',
				callbacks: ['get'],
				version: '',
			  },
			  {
				path: ':gid/:prop',
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
	  console.log('groups param:');
	  console.log(req.params);
	  console.log(req.path);
	  
	  //res.json({info: 'groups'});
	  if(req.params.gid){
		passwd.getGroup({'groupname': req.params.gid}, function(err, group){
			if(err){
				//console.error(err);
				res.status(500).json({error: err.message});
			}
			else{
				if(req.params.prop){
					res.json(group[req.params.prop]);
				}
				else{
					res.json(group);
				}
			}
		});
	  }
	  else{
		//console.log('get groups');
		var groups = passwd.getGroups();
		var groups_data = [];
		
		groups.on('group', function(group) {
			//console.log('user');
			//console.log(JSON.stringify(user));
			groups_data.push(group);
		});
		
		groups.on('end', function() {
			res.json(groups_data);
		});
		
	  }
  },
  initialize: function(options){
	
	this.parent(options);//override default options
	
	this.log('os-groups', 'info', 'os-groups started');
  },
	
});

