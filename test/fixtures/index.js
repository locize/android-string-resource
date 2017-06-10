const fs = require('fs');
const path = require('path');

module.exports = {
  example: {
    js: require('./example.json'),
    asr: fs.readFileSync(path.join(__dirname, 'example.xml')).toString().replace(/\n$/, '')
  }
};
