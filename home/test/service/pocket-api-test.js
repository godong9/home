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

  describe('#makeOauthRedirectPath', function() {
    //given
    var pocket = new Pocket();
    var requestToken = 'abc';
    //when
    var redirectPath = pocket.makeOauthRedirectPath(requestToken);
    //then
    expect(redirectPath).to.equal('https://getpocket.com/auth/authorize?request_token=abc&redirect_uri=http://localhost:3000/oauthCallback?request_token=abc');
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

  describe('#_getJSONBody', function() {
    it('should get json body.', function() {
      //given
      var pocket = new Pocket();
      var res =  {
        body: JSON.stringify({
          "a": "A"
        })
      };
      //when
      var body = pocket._getJSONBody(res);
      //then
      expect(body).to.eql({ a: 'A' });
    });

    it('should get empty json body when invalid json.', function() {
      //given
      var pocket = new Pocket();
      var res =  {
        body: "ABC"
      };
      //when
      var body = pocket._getJSONBody(res);
      //then
      expect(body).to.eql({});
    });
  });

  describe('#_makeGetItemsBody', function() {
    it('should get items body.', function() {
      //given
      var pocket = new Pocket();
      var params = {
        consumer_key: 'abc',
        access_token: 'abc',
        count: 10,
        offset: 0,
        sort: 'newest',
        since: 1467956760
      };
      //when
      var body = pocket._makeGetItemsBody(params);
      //then
      expect(body).to.equal('consumer_key=abc&access_token=abc&count=10&offset=0&sort=newest&since=1467956760');
    });
  });

});

