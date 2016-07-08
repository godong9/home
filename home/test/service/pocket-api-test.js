/**
 * Require modules
 */
var expect = require('chai').expect,
  nock = require('nock');

var Pocket = require('../../service/pocket-api');

describe('Pocket', function() {
  var pocket = new Pocket();

  before(function() {
    nock.disableNetConnect();
    nock.enableNetConnect(/getpocket.com/);
    nock.cleanAll();

    // getRequestToken nock
    nock('https://getpocket.com')
      .persist()
      .filteringPath(/\/v3\/oauth\/request/g, '/mock/oauth/request')
      .post('/mock/oauth/request')
      .reply(200, JSON.stringify({
        "code": "f726a405-faf6-7cb1-ad27-eaa5b8",
        "state": null
      }));

    // getAccessToken nock
    nock('https://getpocket.com')
      .persist()
      .filteringPath(/\/v3\/oauth\/authorize/g, '/mock/oauth/authorize')
      .post('/mock/oauth/authorize')
      .reply(200, JSON.stringify({
        access_token: 'f3af6796-bdd7-27f1-ca3d-b98dc2',
        username: 'test@test.com'
      }));
  });

  after(function() {
    nock.cleanAll();
  });

  describe('#constructor', function() {
    it('should create pocket instance.', function() {
      //given
      var options = {};
      //when
      var pocketInstance = new Pocket(options);
      //then
      expect(pocketInstance).to.exist;
    });
  });

  describe('#getRequestToken', function() {
    it('should get request token', function(done) {
      //given
      var pocket = new Pocket();
      //when
      pocket.getRequestToken(function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result).to.eql({
          code: 'f726a405-faf6-7cb1-ad27-eaa5b8',
          state: null
        });
        done();
      });
    });
  });

  describe('#getAccessToken', function() {
    it('should get access token', function(done) {
      //given
      var pocket = new Pocket();
      var requestToken = 'f726a405-faf6-7cb1-ad27-eaa5b8';
      //when
      pocket.getAccessToken(requestToken, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result).to.eql({
          access_token: 'f3af6796-bdd7-27f1-ca3d-b98dc2',
          username: 'test@test.com'
        });
        done();
      });
    });
  });

  xdescribe('#getPocketItems', function() {
    it('should get pocket items.', function() {
      //given
      var pocket = new Pocket();
      //when
      var pocketItems = pocket.getPocketItems();
      //then
      expect(pocketItems.length).to.equal(2);
    });
  });

});

