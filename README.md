# OWA WRAPPER
HTTP based Outlook Web Access

### FEATURE
* owa_url, username & password only required

# install
with [npm](https://www.npmjs.com/package/owa_wrapper) do:

```
npm install owa_wrapper
```

# usage
for basic test

```js
var owa_wrapper = require('owa_wrapper');
var owa = new owa_wrapper();

var signIn = owa.sign_in({
  owa_url: 'https://mail.linto.com/owa/',
  password: 'password',
  username: 'domain\\linto.cheeran',
});

var $ = cheerio.load(signIn.body); // npm:cheerio required
var mail_id = $(this).find('td:nth-child(4) input[type="checkbox"]').attr('value');

var mail = owa.request('https://mail.linto.com/owa?ae=Item&id=' + encodeURIComponent(mail_id) + '&t=IPM.Note');
var $ = cheerio.load(mail.body); // npm:cheerio required

$('#divAtt #lnkAtmt').each(function() { // attachment download
  owa.attachment_download({
    file_path: '/tmp/attachment.extension',
    url: 'https://mail.linto.com/owa/' + $(this).attr('href'),
  }, function(error, res) {
    if (error) {
      console.log('[OWA_MAIL]', 'downloadAttachment', error);
    }
  });
});
```

### new owa_wrapper(opt)
@return APP[Object] instance

| opt | type | description |
| --- | --- | --- |
| timeout | <code>Number</code> | [optional] timeout for http request [default => 1000 * 60] |


```js
var owa = new owa_wrapper({
  timeout: 1000 * 60,
});
```

### .sign_in(opt)
for owa_url, password & username based signIn

| opt | type | description |
| --- | --- | --- |
| owa_url | <code>String</code> | owa url to signIn (like https://mail.linto.com/owa/) |
| password | <code>String</code> | owa password |
| username | <code>String</code> | owa username |

@return [Object] ```{ error: error, res: res, body: body }```

### .request(relative_url, method, form)
owa SYNC http requesting

| opt | type | description |
| --- | --- | --- |
| url | <code>String</code> |  |
| method | <code>String</code> | default => GET |
| form | <code>Object</code> | for POST data |

@return [Object] { error: error, res: res, body: body }

### .attachment_download(opt, callback)
owa attachment downloading, SYNC if no callback

| opt | type | description |
| --- | --- | --- |
| url | <code>String</code> | attachment url https://mail.linto.com/owa/attachment.ashx?attach=1&id=12345 |
| file_path | <code>String</code> | for write stream |
| callback |  | [optional] function |

@return [Object] error property as error in SYNC, otherwise callback(error, res)
