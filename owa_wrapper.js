var _ = require('underscore'),
  future = require('fibers/future'),
  moment = require('moment'),
  request = require('request');

var app = {
  proxy_list: [],
  timeout: 1000 * 60,
};

/**
 * base64_encode(input) => Base64 encoding
 *
 * @param input [String]
 * @return [String]
 */

function base64_encode(input) {
  return new Buffer(input, 'utf8').toString('base64');
}

/**
 * request(relative_url, method, form)
 *
 * @param [String] relative_url => https://ops.epo.org/3.1/[relative_url]
 * @param [String] method => npm:request.method
 * @param [Object] form => npm:request.form
 * @return [Object]
 */

app.request = function(relative_url, method, form) {
  if (app.consumer_key && app.consumer_secret && app.expires_in && app.issued_at && +moment(app.issued_at, ['x']).format('X') + (+app.expires_in) - 60 < +moment().format('X')) {
    this.signIn();
  }

  var f = new future,
    opt = {
      form: (form ? form : {}),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
      },
      method: (method ? method : 'GET'),
      proxy: _.sample(app.proxy_list),
      timeout: app.timeout,
      url: 'https://ops.epo.org/3.1/' + (relative_url ? relative_url : ''),
    };

  if (app.access_token) {
    opt.headers.Authorization = 'Bearer ' + app.access_token;
  } else {
    if (app.consumer_key && app.consumer_secret && relative_url == 'auth/accesstoken') {
      opt.headers.Authorization = 'Basic ' + base64_encode(app.consumer_key + ':' + app.consumer_secret);
    }
  }

  request(opt, function(error, res, body) {
    if (error) {
      f.return({ error: error, res: res, body: body });
    } else {
      try {
        if (res.statusCode == 200) {
          f.return(JSON.parse(body));
        } else {
          f.return({ error: body });
        }
      } catch (error) {
        f.return({ error: error });
      }
    }
  });

  return f.wait();
};

/**
 * signIn(opt)
 *
 * @param opt [Object] => {consumer_key: [String], consumer_secret: [String]}
 * @return [Boolean]
 */

app.signIn = function(opt) {
  if (opt) {
    _.each(_.pick(opt, ['consumer_key', 'consumer_secret']), function(v, k) {
      app[k] = v;
    });
  }

  if (app.consumer_key && app.consumer_secret) {
    var res = this.request('auth/accesstoken', 'POST', { grant_type: 'client_credentials' });

    if (res.error) {
      console.log('[EPO_OPS_WRAPPER]', res.error);

      return;
    } else {
      _.each(_.pick(res, ['access_token', 'api_product_list', 'application_name', 'client_id', 'developer.email', 'expires_in', 'issued_at', 'organization_name', 'scope', 'status', 'token_type']), function(v, k) {
        app[k] = v;
      });

      return true;
    }
  } else {
    console.log('[EPO_OPS_WRAPPER]', 'required consumer_key & consumer_secret');

    return;
  }
};

/**
 * @param opt [Object] => {proxy_list: [Array of String], timeout: [Number]}
 * @return [Object]
 */

module.exports = function(opt) {
  if (opt) {
    _.each(_.pick(opt, ['proxy_list', 'timeout']), function(v, k) {
      app[k] = v;
    });
  }

  return app;
};
