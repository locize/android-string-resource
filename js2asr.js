const xml2js = require('xml2js');

// https://developer.android.com/guide/topics/resources/string-resource.html#FormattingAndStyling
function escape(str) {
  return str.replace(/"/g, '\\"').replace(/'/g, "\\'");
}

function js2asr(resources, opt, cb) {

  if (typeof opt === 'function') {
    cb = opt;
    opt = { pretty: true, indent: '  ', newline: '\n' };
  }

  const builder = new xml2js.Builder({
    rootName: 'resources',
    headless: false,
    renderOpts: {
      pretty: opt.pretty === false ? false : true,
      indent: opt.indent || '  ',
      newline: opt.newline || '\n'
    },
    xmldec: { version: '1.0', encoding: 'utf-8' }
  });

  const asrJs = {
    $: {},
    string: [],
    'string-array': []
  };

  Object.keys(resources).forEach((key) => {
    if (typeof resources[key] !== 'string' && Array.isArray(resources[key])) {
      const arr = {
        $: {
          name: key
        },
        item: resources[key]
      };
      asrJs['string-array'].push(arr);
    }
    if (typeof resources[key] === 'string') {
      if (/\.\d+$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.');
        const baseKey = key.substring(0, lastDotIdx);
        const arrIdx = key.substring(lastDotIdx + 1, key.length);

        var foundBaseElement = asrJs['string-array'].find((ele) => ele.$.name === baseKey);
        if (!foundBaseElement) {
          foundBaseElement = {
            $: {
              name: baseKey
            },
            item: []
          };
          asrJs['string-array'].push(foundBaseElement);
        }
        foundBaseElement.item[arrIdx] = escape(resources[key]);
      } else {
        const str = {
          $: {
            name: key
          },
          _: escape(resources[key])
        };
        asrJs.string.push(str);
      }
    }
  });

  const xml = builder.buildObject(asrJs);
  if (cb) cb(null, xml);
  return xml;
}

module.exports = js2asr;
