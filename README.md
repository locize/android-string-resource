[![travis](https://img.shields.io/travis/locize/android-string-resource.svg)](https://travis-ci.org/locize/android-string-resource) [![npm](https://img.shields.io/npm/v/android-string-resource.svg)](https://npmjs.org/package/android-string-resource)

## Download

The source is available for download from
[GitHub](https://github.com/locize/android-string-resource/archive/master.zip).
Alternatively, you can install using npm:

```sh
npm install --save android-string-resource
```

You can then `require()` android-string-resource as normal:

```js
const android-string-resource = require('android-string-resource');
```

Or you can direclty `require()` its functions:

```js
const asr2js = require('android-string-resource/asr2js');
```

## Usage

```js

const xml = `<resources>
  <string name="key1">Hello</string>
  <string name="key2">An application to manipulate and process asr documents</string>
  <string name="key.nested">asr Data Manager</string>
</resources>`;

const js = {
  "key1": "Hello",
  "key2": "An application to manipulate and process asr documents",
  "key.nested": "asr Data Manager"
};

const asr2js = require('android-string-resource/asr2js');
asr2js(xml, (err, res) => {
  // res is like js
});

const js2asr = require('android-string-resource/js2asr');
js2asr(js, (err, res) => {
  // res is like xml
});

```
