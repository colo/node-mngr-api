'use strict'

var Moo = require("mootools");

var express = require('express');
var path = require('path');
var router = express.Router();


var app = express();
//app.set('views', path.join(__dirname, 'views'));

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Admin Submodule app' });
  res.json({ title: 'Admin Submodule app' });
  
//  console.log(req.app.locals);
//  next();
});

var test = new Class({
	Implements: [Options, Events],
	
	initialize: function(options){},
});



var routes = {
	post: [
	  {
		path: '',
		callbacks: ['post']
	  },
	],
	all: [
	  {
		path: '',
		callbacks: ['get']
	  },
	]
};


app.use('/', router);
app.set('id', 'admin-sub');

module.exports = app;
module.exports.routes = routes;
