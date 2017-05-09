var express = require('express');
var router = express.Router();


/* main router for the user */
router.get('/', function(req, res, next) {
  res.render('admin', {title: 'Hit Game'});
});



module.exports = router;