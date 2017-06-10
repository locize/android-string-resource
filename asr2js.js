const rdotjson = require('rdotjson');

function asrToJs(str, cb) {
  if (typeof str !== 'string') {
    return cb(new Error('The first parameter was not a string'));
  }

  rdotjson(str, (err, R) => {
    if (err) return cb(err);
    cb(null, R.string);
  });
}

module.exports = asrToJs;
