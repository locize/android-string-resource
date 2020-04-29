import rdotjson from 'rdotjson'

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
  'xliff:g'
]
const regexString = closingTags.map((t) => `(</${t}>)`).concat(singleTags.map((t) => `(<${t})`)).join('|')
const tagsRegex = new RegExp(regexString, 'm')

const trim = (s, c) => {
  if (c === ']') c = '\\'
  if (c === '\\') c = '\\\\'
  return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '')
}

function continueToParse (R, Rhtml, opt, cb) {
  R.string = R.string || {}
  Rhtml = Rhtml || {}
  Rhtml.string = Rhtml.string || {}

  const res = {}
  Object.keys(R.string).forEach((k) => {
    if (typeof R.string[k] === 'object') {
      res[k] = R.string[k].toString()
    } else {
      res[k] = R.string[k]
    }

    if (Rhtml.string[k]) {
      let valueOfHtml = Rhtml.string[k]
      if (typeof valueOfHtml === 'object') valueOfHtml = valueOfHtml.toString()
      if (valueOfHtml.indexOf('<![CDATA[') < 0 && tagsRegex.test(valueOfHtml)) {
        res[k] = valueOfHtml
        if (res[k].indexOf('<xliff:g id="') > -1) {
          res[k] = trim(res[k], '\n ')
        }
      }
    }

    if (opt.comment && R.string[k].attr && R.string[k].attr.comment) {
      res[k] = {
        value: R.string[k].toString(),
        comment: R.string[k].attr.comment
      }
    } else if (opt.comment && R.string[k].comment) {
      res[k] = {
        value: R.string[k].toString(),
        comment: R.string[k].comment
      }
    }
  })

  if (R.array) {
    Object.keys(R.array).forEach((arrKey) => {
      R.array[arrKey].forEach((item, idx) => {
        res[`${arrKey}.${idx}`] = item
      })
    })
  }

  cb(null, res)
}

const asrToJsClb = (str, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt
    // opt = { comment: 'right' };
    opt = {}
  }
  // opt = opt || { comment: 'right' };
  opt = opt || {}

  if (typeof str !== 'string') {
    return cb(new Error('The first parameter was not a string'))
  }

  opt.attr = opt.attr !== undefined ? opt.attr : true

  const hasPossibleTags = str.indexOf('<![CDATA[') < 0 && tagsRegex.test(str)

  rdotjson(str, opt, (err, R) => {
    if (err) return cb(err)

    if (!hasPossibleTags) return continueToParse(R, null, opt, cb)

    opt.xml = true
    rdotjson(str, opt, (err, Rhtml) => {
      delete opt.xml
      if (err) return cb(err)
      continueToParse(R, Rhtml, opt, cb)
    })
  })
}

export default function asrToJs (str, opt, cb) {
  if (!cb && opt === undefined) {
    return new Promise((resolve, reject) => asrToJsClb(str, opt, (err, ret) => err ? reject(err) : resolve(ret)))
  }
  if (!cb && typeof opt !== 'function') {
    return new Promise((resolve, reject) => asrToJsClb(str, opt, (err, ret) => err ? reject(err) : resolve(ret)))
  }
  asrToJsClb(str, opt, cb)
}
