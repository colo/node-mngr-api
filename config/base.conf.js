'use strict'

const App = require('node-express-app'),
			os = require('os'),
			path = require('path'),
			bodyParser = require('body-parser'),
			//multer = require('multer'), // v1.0.5
			//upload = multer(), // for parsing multipart/form-data
			cors = require('cors');

module.exports = new Class({
  Extends: App,

	app: null,
  logger: null,
  authorization:null,
  authentication: null,

	options: {

	  middlewares: [
			bodyParser.json(),
			bodyParser.urlencoded({ extended: true }),
			cors({
				'exposedHeaders': ['Link', 'Content-Range']
			})
	  ],

		id: os.hostname(),
		path: '/',

		//cors: {
			//'exposedHeaders': ['Link', 'Content-Range']
		//},

		logs: undefined,

		authentication: {
			users : [
					{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
			],
		},

		authorization: {
			config: path.join(__dirname,'./rbac.json'),
		},

		/**
		 * for PROFILING testing
		 *
		routes: {
			get: [
				{
					path: '/app',
					callbacks: ['get_app'],
				},
			],
		},
		*/

		api: {

			version: '1.0.0',

			routes: {
				get: [
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				],
				all: [
					{
						path: '',
						callbacks: ['404'],
						version: '',
					},
				]
			},

		},
  },

});
