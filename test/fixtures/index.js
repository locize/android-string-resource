const fs = require('fs');
const path = require('path');

module.exports = {
  example: {
    js: require('./example.json'),
    asr: fs.readFileSync(path.join(__dirname, 'example.xml')).toString().replace(/\n$/, '')
  },
  example_comment: {
    js: require('./example_comment.json'),
    asr: fs.readFileSync(path.join(__dirname, 'example_comment.xml')).toString().replace(/\n$/, '')
  },
  example_comment2: {
    js: require('./example_comment.json'),
    asr: fs.readFileSync(path.join(__dirname, 'example_comment2.xml')).toString().replace(/\n$/, '')
  }
};
