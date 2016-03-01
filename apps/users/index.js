var express = require('express');
var router = express.Router();



var app = express();

app.param('param', function (req, res, next, param) {
	console.log('CALLED ONLY ONCE:'+param);
	next();
});
		
/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.json(req.app.locals);
  res.json({ title: 'Users app' });
});

app.get('/:param', function(req, res, next) {
  //res.json(req.app.locals);
  res.json({ title: 'Users app', param: req.params});
});

app.use('/', router);

module.exports = app;

