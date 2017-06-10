const xml2js = require('xml2js');

function js2asr(resources, opt, cb) {

  if (typeof opt === 'function') {
    cb = opt;
    opt = { pretty: true, indent: ' ', newline: '\n' };
  }

  const builder = new xml2js.Builder({
    rootName: 'resources',
    headless: true,
    pretty: opt.pretty,
    indent: opt.indent || ' ',
    newline: opt.newline || '\n'
  });

  const asrJs = {
    $: {},
    string: []
  };

  Object.keys(resources).forEach((key) => {
    const str = {
      $: {
        name: key
      },
      _: resources[key]
    };
    asrJs.string.push(str);
  });

  const xml = builder.buildObject(asrJs);
  if (cb) cb(null, xml);
  return xml;
}

module.exports = js2asr;
