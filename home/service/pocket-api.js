"use strict";

/**
 * npm modules
 */
var _ = require('underscore');
var request = require('request');
var async = require('async');
var logger =  require('log4js').getLogger('Pocket-Api');
var QueryString = require('querystring');

var CONSUMER_KEY = '<CONSUMER_KEY>';
var REDIRECT_URI = '<REDIRECT_URI>';
var HEADERS = {
  'Content-type': 'application/x-www-form-urlencoded',
  'X-Accept': 'application/json'
};

/**
 * Pocket
 * @constructor
 */
function Pocket(options) {
  this.options = _.extend({
    request_token_path: 'https://getpocket.com/v3/oauth/request',
    authorize_path: 'https://getpocket.com/auth/authorize',
    oauth_callback_path: 'http://localhost:3000/oauthCallback',
    access_token_path: 'https://getpocket.com/v3/oauth/authorize',
    get_items_path: 'https://getpocket.com/v3/get'
  }, options);
}

Pocket.prototype.getRequestToken = function(finalCallback) {
  var self = this;
  var requestOptions = {
    url: self.options.request_token_path,
    headers: HEADERS,
    body: 'consumer_key=' + CONSUMER_KEY + '&redirect_uri=' + REDIRECT_URI
  };
  request.post(requestOptions, function (err, res) {
    var result;
    logger.debug('[getRequestToken]res.body:', res.body);
    if (err) {
      logger.error(err);
    }
    result = self._getJSONBody(res);
    finalCallback(err, result);
  });
};

/**
 * oauth 인증시 리다이렉트 해주는 패스 만들어주는 메서드
 *
 * @param {String} requestToken - 요청 토큰
 * @returns {string}
 */
Pocket.prototype.makeOauthRedirectPath = function(requestToken) {
  var redirectUrl = this.options.authorize_path;
  redirectUrl += '?request_token=' + requestToken;
  redirectUrl += '&redirect_uri=' + this.options.oauth_callback_path + '?request_token=' + requestToken;

  return redirectUrl;
};

Pocket.prototype.getAccessToken = function(requestToken, finalCallback) {
  var self = this;
  logger.debug('[getAccessToken]requestToken:', requestToken);
  var requestOptions = {
    url: self.options.access_token_path,
    headers: HEADERS,
    body: 'consumer_key=' + CONSUMER_KEY + '&code=' + requestToken
  };
  request.post(requestOptions, function (err, res) {
    var result;
    logger.debug('[getAccessToken]res.body:', res.body);
    if (err) {
      logger.error(err);
    }
    result = self._getJSONBody(res);
    finalCallback(err, result);
  });
};

Pocket.prototype.getPocketItems = function(req, finalCallback) {
  var self = this;
  var params = {
    consumer_key: CONSUMER_KEY,
    access_token: req.query.access_token,
    count: req.query.count || 10,
    offset: req.query.offset || 0,
    sort: req.query.sort || 'newest',
    since: 1467956760
  };
  logger.debug('[getPocketItems]accessToken:', req.query.access_token);
  var requestOptions = {
    url: self.options.get_items_path,
    headers: HEADERS,
    body: self._makeGetItemsBody(params)
  };
  request.post(requestOptions, function (err, res) {
    var result;
    logger.debug('[getPocketItems]res.body:', res.body);
    if (err) {
      logger.error(err);
    }
    result = self._getJSONBody(res);
    finalCallback(err, result);
  });
};


Pocket.prototype._getJSONBody = function(res) {
  var result = {};
  try {
    result = JSON.parse(res.body);
    logger.debug(result);
  } catch(e) {
    result = {};
  }
  return result;
};

/**
 * 포켓 아이템 가져올 때 body 만들어주는 내부 메서드
 *
 * @param {Object} params
 * @param {String} params.consumer_key - 앱 API 키
 * @param {String} params.access_token - 액세스 토큰
 * @param {Number} [params.count] - 가져올 개수
 * @param {Number} [params.offset] - 오프셋
 * @param {String} [params.sort] - 정렬기준
 * @param {Date} [params.since] - 이후로 가져올 타임스탬프
 * @returns {String}
 * @private
 */
Pocket.prototype._makeGetItemsBody = function(params) {
  return QueryString.stringify(params, '&', '=');
};


module.exports = Pocket;