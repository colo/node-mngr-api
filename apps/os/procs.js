'use strict'

var App = require('node-express-app'),
	path = require('path'),
	exec = require('child_process').exec,
	procinfo = require('procinfo'),
	Q = require('q');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  procs: [],
  
  options: {
	  
	id: 'procs',
	path: '/os/procs',
	
	//authorization: {
		//config: path.join(__dirname,'./config/rbac.json'),
	//},
	
	params: {
	  prop: /fs|type|bloks|used|available|percentage|proc_point/
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
				path: ':proc',
				callbacks: ['get_proc'],
				version: '',
			  },
			  {
				path: ':proc/:prop',
				callbacks: ['get_proc'],
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
  /**
   * need to send encoded "/" (%2F)
   * 
   * */
  get_proc: function (req, res, next){
	console.log('procs param:');
	console.log(req.params);
	
	if(req.params.proc){
		this._procs(req.params.proc)
		.then(function(result){
			//console.log(result);
			if(!(typeof(req.params.prop) == 'undefined')){
				
				if(result[req.params.prop]){
					res.json(result[req.params.prop]);
				}
				else{
					res.status(500).json({error: 'bad proc property'});
				}
				
			}
			else{
				res.json(result);
			}
			
		}, function (error) {
			//console.log('error');
			//console.log(error);
			res.status(500).json({error: error.message});
		})
		.done();
	}
	else{
		res.status(500).json({error: 'bad proc param'});
	}
  },
  get: function (req, res, next){
	//this._procs()
	//.then(function(result){
		//res.json(result);
	//})
	//.done();
	procinfo.fields = ['state', 'etime'];
	procinfo(new RegExp("\\w+"), function(err, results) {
		// output the pids that have been found (should be just pid: 1) 
		//console.log(results.pids);
	   
		// now output the process details 
		//console.log(results[19197]);
		console.log(results);
	});
	
	res.json({});
  },
  _procs: function(proc){
	var deferred = Q.defer();
	
	if(proc){//if proc param
		if(this.procs.length == 0){//if procs[] empty, call without params
			this._procs()
			.then(function(){
				deferred.resolve(this._procs(proc));
			}.bind(this), function (error) {
				deferred.reject(error);
			})
			.done();
		}
		else{
			this.procs.each(function(item, index){
				if(item.fs == proc){
					deferred.resolve(item);
				}
			});
			
			deferred.reject(new Error('Proc not found'));
		}
		
		
	}
	else{
		this.procs = [];
		var child = exec(
			this.command,
			function (err, stdout, stderr) {
				
				if (err) deferred.reject(err);
				
				var data = stdout.split('\n');

				//drives.splice(0, 1);
				//drives.splice(-1, 1);
				//var procs = [];
				data.each(function(item, index){
					if(index != 0 && index != data.length -1 ){
						//console.log(item.clean().split(' '));
						var tmp = item.clean().split(' ');
						this.procs.push({
							fs: tmp[0],
							type: tmp[1],
							bloks: tmp[2],
							used: tmp[3],
							availabe: tmp[4],
							percentage: tmp[5].substring(0, tmp[5].length - 1),
							proc_point: tmp[6],
						})
					}
				}.bind(this));
				
				deferred.resolve(this.procs);
			}.bind(this)
		);
	}
	
    return deferred.promise;  
  },
  initialize: function(options){
	
	this.parent(options);//override default options
	
	this.log('os-procs', 'info', 'os-procs started');
  },
	
});

