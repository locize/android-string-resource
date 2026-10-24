const expect = require('expect.js')
const fixtures = require('./fixtures')

function test (what, t) {
  describe(what, () => {
    it('index', t(require('../')[what]))
    it('direct', t(require('../cjs/' + what)))
  })
}

test('asr2js', (fn) => (done) => {
  fn(fixtures.example.asr, (err, res) => {
    expect(err).not.to.be.ok()
    expect(res).to.eql(fixtures.example.js)
    done()
  })
})

test('js2asr', (fn) => (done) => {
  fn(fixtures.example.js, (err, res) => {
    expect(err).not.to.be.ok()
    expect(res).to.eql(fixtures.example.asr)
    done()
  })
})

describe('xmlns tags', () => {
  test('asr2js', (fn) => (done) => {
    fn(fixtures.example_xmlns.asr, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_xmlns.js)
      done()
    })
  })

  test('js2asr', (fn) => (done) => {
    fn(fixtures.example_xmlns.js, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_xmlns.asr)
      done()
    })
  })
})

describe('promise', () => {
  test('asr2js', (fn) => (done) => {
    fn(fixtures.example.asr, {}).then((res) => {
      expect(res).to.eql(fixtures.example.js)
      done()
    })
  })

  test('js2asr', (fn) => (done) => {
    fn(fixtures.example.js).then((res) => {
      expect(res).to.eql(fixtures.example.asr)
      done()
    })
  })
})

describe('js2asr with options', () => {
  const js2asr = require('../cjs/js2asr')
  it('it should work as expected', (done) => {
    js2asr(fixtures.example.js, { indent: ' ' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example.asr.replace(/ {2}/g, ' '))
      done()
    })
  })
})

describe('asr2js with comments', () => {
  const asr2js = require('../cjs/asr2js')
  it('it should work as expected', (done) => {
    asr2js(fixtures.example_comment.asr, { comment: 'right' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_comment.js)
      done()
    })
  })
})

describe('js2asr with comments', () => {
  test('js2asr', (fn) => (done) => {
    fn(fixtures.example_comment.js, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_comment.asr)
      done()
    })
  })
})

describe('asr2js with comments as attribute', () => {
  const asr2js = require('../cjs/asr2js')
  it('it should work as expected', (done) => {
    asr2js(fixtures.example_comment2.asr, { comment: 'right' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_comment2.js)
      done()
    })
  })
})

describe('js2asr with comments as attribute', () => {
  const js2asr = require('../cjs/js2asr')
  it('it should work as expected', (done) => {
    js2asr(fixtures.example_comment2.js, { comment: 'attribute' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql(fixtures.example_comment2.asr)
      done()
    })
  })
})

describe('js2asr with comments on string-array items', () => {
  const js2asr = require('../cjs/js2asr')
  it('it should work as expected', (done) => {
    js2asr({
      'planets_array.0': { value: 'Mercury', comment: 'c0' },
      'planets_array.1': { value: 'Venus', comment: 'c1' }
    }, { comment: 'comment' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <string-array name="planets_array">\n    <item>Mercury</item>\n    <item>Venus</item>\n  </string-array>\n</resources>')
      done()
    })
  })
})

describe('js2asr with a null value', () => {
  const js2asr = require('../cjs/js2asr')
  it('it should not throw', (done) => {
    js2asr({ key1: 'Hello', keyNull: null }, { comment: 'comment' }, (err, res) => {
      expect(err).not.to.be.ok()
      expect(res).to.eql('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <string name="key1">Hello</string>\n</resources>')
      done()
    })
  })
})

describe('asr2js callback invocation', () => {
  const asr2js = require('../cjs/asr2js')
  it('it should invoke the callback once even if it throws', (done) => {
    let calls = 0
    let thrown = null
    try {
      asr2js('<resources><plurals name="p"><item quantity="one">%s a</item><item quantity="other">%s b</item></plurals></resources>', { comment: 'right' }, () => {
        calls++
        throw new Error('user callback error')
      })
    } catch (e) {
      thrown = e
    }
    expect(thrown).to.be.ok()
    expect(calls).to.be(1)
    done()
  })
})

describe('backslashes', () => {
  const js = { path: 'C:\\temp\\new', literal: 'a\\nb', trailing: 'ends\\' }

  test('js2asr', (fn) => async () => {
    const xml = await fn(js)
    expect(xml).to.contain('<string name="path">C:\\\\temp\\\\new</string>')
    expect(await require('../').asr2js(xml)).to.eql(js)
  })
})

describe('escapes as Android reads them', () => {
  const { js2asr, asr2js } = require('../')
  const values = { nl: 'a\nb', tab: 'a\tb', path: 'C:\\temp', apos: "It's", quote: 'say "hi"', star: 'Star ★', nbsp: 'a\u00A0b', at: '@home', q: '?why' }

  it('round-trips strings, string-arrays and plurals', async () => {
    const js = {}
    Object.keys(values).forEach((k) => {
      js[`s_${k}`] = values[k]
      js[`arr_${k}.0`] = values[k]
      js[`pl_${k}.one`] = values[k]
      js[`pl_${k}.other`] = values[k]
    })
    const xml = await js2asr(js)
    expect(xml).to.contain('<string name="s_tab">a\\tb</string>')
    expect(xml).to.contain('<string name="s_at">\\@home</string>')
    expect(xml).to.contain('<string name="s_q">\\?why</string>')
    expect(await asr2js(xml)).to.eql(js)
  })

  it('decodes hand-written \\t and \\uXXXX, keeps an escaped backslash', async () => {
    const xml = '<resources><string name="u">Star \\u2605</string><string name="t">a\\tb</string><string name="nb">a\\u00A0b</string><string name="lit">C:\\\\u2605</string><string-array name="arr"><item>Star \\u2605</item></string-array><plurals name="p"><item quantity="one">Star \\u2605</item><item quantity="other">a\\nb \\"q\\"</item></plurals></resources>'
    expect(await asr2js(xml)).to.eql({ u: 'Star ★', t: 'a\tb', nb: 'a\u00A0b', lit: 'C:\\u2605', 'arr.0': 'Star ★', 'p.one': 'Star ★', 'p.other': 'a\nb "q"' })
  })
})
