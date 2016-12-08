var future = require('fibers/future'),
  request = require('request');

var APP = function() {
  this.timeout = 1000 * 60;
};

APP.prototype.attachment_download = function(opt, callback) {
  var _this = this;

  try {
    var f = new future,
      write_stream = fs.createWriteStream(opt.file_path);

    request({
      followAllRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5',
      },
      jar: true,
      method: 'GET',
      timeout: 1000 * 60 * 15,
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
      timeout: app.timeout,
      url: url,
    };

  request(opt, function(error, res, body) {
    f.return({ error: error, res: res, body: body });
  });

  return f.wait();
};

APP.prototype.signIn = function(opt) {
  return this.request(opt.owa_url + 'auth/owaauth.dll', 'POST', {
    destination: opt.owa_url,
    flags: 4,
    password: opt.password,
    username: opt.username,
  });
};

module.exports = APP;
