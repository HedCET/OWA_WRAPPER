var future = require('fibers/future'),
  request = require('request');

/**
 * @param opt [Object] => {timeout: [Number]} (timeout * 10 in attachment_download)
 */

var APP = function(opt) {
  this.timeout = (opt && opt.timeout ? opt.timeout : 1000 * 60);
};

/**
 * attachment_download(opt, callback)
 *
 * @param [String] opt.url => https://mail.linto.com/owa/attachment.ashx?attach=1&id=12345
 * @param [String] opt.file_path => for write stream
 * @return callback(error, res) OR [Object] (error as property)
 */

APP.prototype.attachment_download = function(opt, callback) {
  var _this = this,
    f;

  if (typeof callback !== 'function') {
    f = new future;
  }

  try {
    var write_stream = fs.createWriteStream(opt.file_path);

    request({
      followAllRedirects: true,
      form: (opt.form ? opt.form : {}),
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5',
      },
      jar: true,
      method: (opt.method ? opt.method : 'GET'),
      timeout: _this.timeout * 10,
      url: opt.url,
    }).pipe(write_stream);

    write_stream.on('finish', function() {
      if (typeof callback === 'function') {
        callback.call(_this, null, opt);
      } else {
        f.return(opt);
      }
    });
  } catch (e) {
    if (typeof callback === 'function') {
      callback.call(_this, e, opt);
    } else {
      opt.error = e;

      f.return(opt);
    }
  }

  if (typeof callback !== 'function') {
    return f.wait();
  }
};

/**
 * request(url, method, form)
 *
 * @param [String] url
 * @param [String] method => npm:request.method
 * @param [Object] form => npm:request.form
 * @return [Object] { error: error, res: res, body: body }
 */

APP.prototype.request = function(url, method, form) {
  var f = new future,
    opt = {
      followAllRedirects: true,
      form: (form ? form : {}),
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5',
      },
      jar: true,
      method: (method ? method : 'GET'),
      timeout: this.timeout,
      url: url,
    };

  request(opt, function(error, res, body) {
    f.return({ error: error, res: res, body: body });
  });

  return f.wait();
};

/**
 * sign_in(opt)
 *
 * @param [String] opt.owa_url => https://mail.linto.com/owa
 * @param [String] opt.password
 * @param [String] opt.username
 * @return [Object] { error: error, res: res, body: body }
 */

APP.prototype.sign_in = function(opt) {
  return this.request((opt.owa_url.match(/\/$/) ? opt.owa_url : opt.owa_url + '/') + 'auth/owaauth.dll', 'POST', { destination: opt.owa_url, flags: 4, password: opt.password, username: opt.username });
};

module.exports = APP;
