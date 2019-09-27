const rdotjson = require('rdotjson');

function asrToJs(str, opt, cb) {
  if (typeof str !== 'string') {
    return cb(new Error('The first parameter was not a string'));
  }

  if (typeof opt === 'function') {
    cb = opt;
    // opt = { comment: 'right' };
    opt = {};
  }

  opt.attr = opt.attr !== undefined ? opt.attr : true;

  rdotjson(str, opt, (err, R) => {
    if (err) return cb(err);

    R.string = R.string || {};

    const res = {};
    Object.keys(R.string).forEach((k) => {
      if (typeof R.string[k] === 'object') {
        res[k] = R.string[k].toString();
      } else {
        res[k] = R.string[k];
      }
      if (opt.comment && R.string[k].attr && R.string[k].attr.comment) {
        res[k] = {
          value: R.string[k].toString(),
          comment: R.string[k].attr.comment
        };
      } else if (opt.comment && R.string[k].comment) {
        res[k] = {
          value: R.string[k].toString(),
          comment: R.string[k].comment
        };
      }
    });

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
