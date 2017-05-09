var express = require('express');
var router = express.Router();

/* main router for the user */
router.get('/', function(req, res, next) {
  res.render('user', {title: 'Hit Game | player'});
});




module.exports = router;