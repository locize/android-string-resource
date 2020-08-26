import convert from 'xml-js'

// https://developer.android.com/guide/topics/resources/string-resource.html#FormattingAndStyling
const escape = (str) => str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, '\\n')

const singleTags = [
  'div',
  'br',
  'span'
]
const closingTags = [
  'b',
  'em',
  'i',
  'cite',
  'dfn',
  'big',
  'small',
  'font',
  'tt',
  's',
  'strike',
  'del',
  'u',
  'sup',
  'sub',
  'ul',
  'li',
  'p',
  'xliff:g',
  'a'
]
const regexString = closingTags.map((t) => `(</${t}>)`).concat(singleTags.map((t) => `(<${t})`)).join('|')
const tagsRegex = new RegExp(regexString, 'm')

const textOrCData = (text) => {
  if (text.indexOf('<![CDATA[') < 0 && tagsRegex.test(text)) {
    return {
      type: 'cdata',
      cdata: text
    }
  }
  return {
    type: 'text',
    text: escape(text)
  }
}

const getElements = (text) => {
  if (text.indexOf('<![CDATA[') < 0 && tagsRegex.test(text)) {
    const jsxml = convert.xml2js('<root>' + text + '</root>', { compress: false })
    jsxml.elements[0].elements.forEach((ele) => {
      if (ele.type === 'text') ele.text = escape(ele.text)
    })
    return jsxml.elements[0].elements
  }
  return [textOrCData(text)]
}

const js2asrClb = (resources, opt, cb) => {
  if (!cb && typeof opt === 'function') {
    cb = opt
    opt = { indent: '  ' }
  }
  opt = opt || { indent: '  ' }
  opt.comment = opt.comment || 'comment'
  const options = {
    spaces: opt.indent || '  ',
    compact: false
  }

  const declAttr = {
    version: '1.0',
    encoding: 'utf-8'
  }

  const resAttr = {}

  const comments = []

  const stringElements = []
  const arrayElements = []
  const pluralElements = []

  Object.keys(resources).forEach((key) => {
    if (typeof resources[key] !== 'string' && Array.isArray(resources[key])) {
      arrayElements.push({
        type: 'element',
        name: 'string-array',
        attributes: {
          name: key
        },
        elements: resources[key].map((arrItem) => ({
          type: 'element',
          name: 'item',
          elements: getElements(arrItem)
        }))
      })
    } else if (typeof resources[key] === 'string') {
      if (/\.(zero|one|two|few|many|other)$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const plForm = key.substring(lastDotIdx + 1, key.length)

        let foundBaseElement = pluralElements.find((ele) => ele.attributes.name === baseKey)
        if (!foundBaseElement) {
          foundBaseElement = {
            type: 'element',
            name: 'plurals',
            attributes: {
              name: baseKey
            },
            elements: []
          }
          pluralElements.push(foundBaseElement)
        }
        foundBaseElement.elements.push({
          type: 'element',
          name: 'item',
          attributes: {
            quantity: plForm
          },
          elements: getElements(resources[key])
        })
      } else if (/\.\d+$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const arrIdx = key.substring(lastDotIdx + 1, key.length)

        let foundBaseElement = arrayElements.find((ele) => ele.attributes.name === baseKey)
        if (!foundBaseElement) {
          foundBaseElement = {
            type: 'element',
            name: 'string-array',
            attributes: {
              name: baseKey
            },
            elements: []
          }
          arrayElements.push(foundBaseElement)
        }
        foundBaseElement.elements[arrIdx] = {
          type: 'element',
          name: 'item',
          elements: getElements(resources[key])
        }
      } else {
        if (resources[key].indexOf('<xliff:g ') > -1) {
          const jsxml = convert.xml2js('<root>' + resources[key] + '</root>', { compress: false })
          stringElements.push({
            type: 'element',
            name: 'string',
            attributes: {
              name: key
            },
            elements: jsxml.elements[0].elements
          })
        } else {
          stringElements.push({
            type: 'element',
            name: 'string',
            attributes: {
              name: key
            },
            elements: getElements(resources[key])
          })
        }
      }

      if (resources[key].indexOf('<xliff:g ') > -1 && !resAttr['xmlns:xliff']) {
        resAttr['xmlns:xliff'] = 'urn:oasis:names:tc:xliff:document:1.2'
      }
    }

    if (typeof resources[key] === 'object' && typeof resources[key].value === 'string' && typeof resources[key].comment === 'string') {
      if (/\.(zero|one|two|few|many|other)$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const plForm = key.substring(lastDotIdx + 1, key.length)

        let foundBaseElement = pluralElements.find((ele) => ele.attributes.name === baseKey)
        if (!foundBaseElement) {
          foundBaseElement = {
            type: 'element',
            name: 'plurals',
            attributes: {
              name: baseKey
            },
            elements: []
          }
          pluralElements.push(foundBaseElement)
        }
        foundBaseElement.elements.push({
          type: 'element',
          name: 'item',
          attributes: {
            quantity: plForm
          },
          elements: getElements(resources[key].value)
        })
      } else if (/\.\d+$/.test(key)) {
        const lastDotIdx = key.lastIndexOf('.')
        const baseKey = key.substring(0, lastDotIdx)
        const arrIdx = key.substring(lastDotIdx + 1, key.length)

        var foundBaseElementWithComment = arrayElements.find((ele) => ele.attributes.name === baseKey)
        if (!foundBaseElementWithComment) {
          foundBaseElementWithComment = {
            attributes: {
              name: baseKey
            },
            elements: []
          }
          arrayElements.push(foundBaseElementWithComment)
        }
        foundBaseElementWithComment.elements[arrIdx] = {
          type: 'element',
          name: 'item',
          elements: getElements(resources[key].value)
        }
      } else {
        if (resources[key].value.indexOf('<xliff:g ') > -1) {
          const jsxml = convert.xml2js('<root>' + resources[key].value + '</root>', { compress: false })
          stringElements.push({
            type: 'element',
            name: 'string',
            attributes: {
              name: key
            },
            elements: jsxml.elements[0].elements
          })
        } else {
          const ele = {
            type: 'element',
            name: 'string',
            attributes: {
              name: key
            },
            elements: getElements(resources[key].value)
          }
          if (opt.comment === 'attribute') {
            ele.attributes.comment = resources[key].comment
          }
          stringElements.push(ele)
        }
      }
      comments.push(key)
    }
  })

  const removeFromArrayElements = []
  arrayElements.forEach((ele) => {
    if (ele.elements.length > 1 && ele.elements.filter((e) => e).length === 1) {
      const subElement = ele.elements.find((e) => e)
      const key = `${ele.attributes.name}.${ele.elements.indexOf(subElement)}`
      stringElements.push({
        type: 'element',
        name: 'string',
        attributes: {
          name: key
        },
        elements: subElement.elements
      })
      removeFromArrayElements.push(ele)
    }
  })
  removeFromArrayElements.forEach((ele) => {
    arrayElements.splice(arrayElements.indexOf(ele), 1)
  })

  const res = stringElements.concat(arrayElements).concat(pluralElements)

  let xml = convert.js2xml({
    declaration: {
      attributes: declAttr
    },
    elements: [
      {
        type: 'element',
        name: 'resources',
        elements: res,
        attributes: resAttr
      }
    ]
  }, options)

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
