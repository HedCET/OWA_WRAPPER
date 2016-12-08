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

```js
var signIn = owa_wrapper.sign_in({
  owa_url: 'https://mail.linto.com/owa/',
  password: 'password',
  username: 'domain\\linto.cheeran',
});

var $ = cheerio.load(signIn.body); // npm:cheerio required
var mail_id = $(this).find('td:nth-child(4) input[type="checkbox"]').attr('value');

var mail = owa_wrapper.request('https://mail.linto.com/owa?ae=Item&id=' + encodeURIComponent(mail_id) + '&t=IPM.Note');

$('#divAtt #lnkAtmt').each(function() {
  owa_wrapper.attachment_download({
    file_path: '/tmp/attachment.extension',
    url: 'https://mail.linto.com/owa/' + $(this).attr('href'),
  }, function(error, res) {
    if (error) {
      console.log('[OWA_MAIL]', 'downloadAttachment', error);
    }
  });
});
```
