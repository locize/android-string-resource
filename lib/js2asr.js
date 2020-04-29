import xml2js from 'xml2js'

// https://developer.android.com/guide/topics/resources/string-resource.html#FormattingAndStyling
const escape = (str) => str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, '\\n')

const getValueBetween = (string, start, end) => {
  const removedFirstPart = string.substring(string.indexOf(start) + start.length)
  return removedFirstPart.substring(0, removedFirstPart.indexOf(end))
}

const trim = (s, c) => {
  if (c === ']') c = '\\'
  if (c === '\\') c = '\\\\'
  return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '')
}

const js2asrClb = (resources, opt, cb) => {
  if (!cb && typeof opt === 'function') {
    cb = opt
    opt = { pretty: true, indent: '  ', newline: '\n' }
  }
  opt = opt || { pretty: true, indent: '  ', newline: '\n' }
  opt.comment = opt.comment || 'comment'

  // const resString = JSON.stringify(resources);

  const builder = new xml2js.Builder({
    rootName: 'resources',
    headless: false,
    renderOpts: {
      pretty: opt.pretty !== false,
      indent: opt.indent || '  ',
      newline: opt.newline || '\n'
    },
    xmldec: { version: '1.0', encoding: 'utf-8' },
    cdata: true// resString.indexOf('<') > -1 && resString.indexOf('>') > resString.indexOf('<')
  })

  const asrJs = {
    $: {},
    string: [],
    'string-array': []
  }

  const comments = []
  Object.keys(resources).forEach((key) => {
    if (typeof resources[key] !== 'string' && Array.isArray(resources[key])) {
      const arr = {
        $: {
          name: key
        },
        item: resources[key]
      }
      asrJs['string-array'].push(arr)
    }
    if (typeof resources[key] === 'string') {
      if (/\.\d+$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const arrIdx = key.substring(lastDotIdx + 1, key.length)

        var foundBaseElement = asrJs['string-array'].find((ele) => ele.$.name === baseKey)
        if (!foundBaseElement) {
          foundBaseElement = {
            $: {
              name: baseKey
            },
            item: []
          }
          asrJs['string-array'].push(foundBaseElement)
        }
        foundBaseElement.item[arrIdx] = escape(resources[key])
      } else {
        const str = {
          $: {
            name: key
          }
        }
        const trimmedRes = trim(resources[key], '\n ')
        if (resources[key].indexOf('<xliff:g id="') > -1) {
          const id = getValueBetween(resources[key], '<xliff:g id="', '"')
          const elValue = getValueBetween(resources[key], `<xliff:g id="${id}">`, '</xliff:g>')
          if (trimmedRes.indexOf('<xliff:g id="') > 0) {
            const restOfSegment = resources[key].substring(0, resources[key].indexOf('<xliff:g id="'))
            str._ = escape(trim(restOfSegment, '\n '))
          }
          str['xliff:g'] = {
            $: {
              id
            },
            _: escape(elValue)
          }
          if (trimmedRes.indexOf('<xliff:g id="') === 0) {
            const restOfSegment = resources[key].substring(resources[key].indexOf('</xliff:g>') + 10)
            str._ = escape(trim(restOfSegment, '\n '))
          }
        } else {
          str._ = escape(resources[key])
        }
        asrJs.string.push(str)
      }
    }

    if (typeof resources[key] === 'object' && typeof resources[key].value === 'string' && typeof resources[key].comment === 'string') {
      if (/\.\d+$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const arrIdx = key.substring(lastDotIdx + 1, key.length)

        var foundBaseElementWithComment = asrJs['string-array'].find((ele) => ele.$.name === baseKey)
        if (!foundBaseElementWithComment) {
          foundBaseElementWithComment = {
            $: {
              name: baseKey
            },
            item: []
          }
          asrJs['string-array'].push(foundBaseElementWithComment)
        }
        foundBaseElementWithComment.item[arrIdx] = escape(resources[key].value)
      } else {
        const str = {
          $: {
            name: key
          },
          _: escape(resources[key].value)
        }
        if (opt.comment === 'attribute') {
          str.$.comment = resources[key].comment
        }
        asrJs.string.push(str)
      }
      comments.push(key)
    }
  })

  var xml = builder.buildObject(asrJs)
  if (opt.comment === 'comment') {
    comments.forEach((key) => {
      const keyIndex = xml.indexOf(`name="${key}"`)
      if (keyIndex < 0) return
      const indexToAppend = keyIndex + xml.substring(keyIndex).indexOf('</string>') + 9
      if (indexToAppend < 0) return
      xml = [xml.slice(0, indexToAppend), ` <!-- ${resources[key].comment} -->`, xml.slice(indexToAppend)].join('')
    })
  }
  if (cb) cb(null, xml)
  return xml
}

export default function js2asr (resources, opt, cb) {
  if (!cb && opt === undefined) {
    return new Promise((resolve, reject) => js2asrClb(resources, opt, (err, ret) => err ? reject(err) : resolve(ret)))
  }
  if (!cb && typeof opt !== 'function') {
    return new Promise((resolve, reject) => js2asrClb(resources, opt, (err, ret) => err ? reject(err) : resolve(ret)))
  }
  js2asrClb(resources, opt, cb)
}
