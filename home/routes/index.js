var express = require('express');
var router = express.Router();
var Pocket = require('../service/pocket-api');

var pocket = new Pocket({});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET auth */
router.get('/oauth', function(req, res) {
  pocket.getRequestToken(function(err, result) {
    var redirectUrl = pocket.options.authorize_path;
    if (err) {
      return res.redirect(404);
    }
    redirectUrl += '?request_token=' + result.code + '&redirect_uri=' + pocket.makeOauthCallbackPath(result.code);
    res.redirect(redirectUrl);
  });
});

router.get('/oauthCallback', function(req, res) {
  pocket.getAccessToken(req.query.request_token, function(err, result) {
    if (err) {
      return res.redirect(404);
    }
    res.redirect('/items?access_token=' + result.access_token);
  });
});

router.get('/items', function(req, res) {
  pocket.getPocketItems(req, function(err, result) {
    res.status(200).send(result);
  });
});


module.exports = router;
