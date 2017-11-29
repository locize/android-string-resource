const expect = require('expect.js');
const fixtures = require('./fixtures');

function test(what, t) {
  describe(what, () => {
    it('index', t(require('../')[what]));
    it('direct', t(require('../' + what)));
  });
}

test('asr2js', (fn) => (done) => {
  fn(fixtures.example.asr, (err, res) => {
    expect(err).not.to.be.ok();
    expect(res).to.eql(fixtures.example.js);
    done();
  });
});

test('js2asr', (fn) => (done) => {
  fn(fixtures.example.js, (err, res) => {
    expect(err).not.to.be.ok();
    expect(res).to.eql(fixtures.example.asr);
    done();
  });
});

describe('js2asr with options', () => {
  const js2asr = require('../js2asr');
  it('it should work as expected', (done) => {
    js2asr(fixtures.example.js, { indent: ' ' }, (err, res) => {
      expect(err).not.to.be.ok();
      expect(res).to.eql(fixtures.example.asr.replace(/  /g, ' '));
      done();
    });
  });
});
