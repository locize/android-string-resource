const rdotjson = require('rdotjson');

function asrToJs(str, cb) {
  if (typeof str !== 'string') {
    return cb(new Error('The first parameter was not a string'));
  }

  rdotjson(str, (err, R) => {
    if (err) return cb(err);

    const res = R.string;

    if (R.array) {
      Object.keys(R.array).forEach((arrKey) => {
        R.array[arrKey].forEach((item, idx) => {
          res[`${arrKey}.${idx}`] = item;
        });
      });
    }

    cb(null, res);
  });
}

module.exports = asrToJs;
