const system_extension = require('../src');

const identifier = process.argv[2];
if (!identifier) {
  console.error('Usage:', process.argv[1], '<identifier>');
  process.exit(-1);
}

console.log('basic: imported module:', system_extension);

function _eventHandler(reason, ident, result) {
  console.log('basic: _eventHandler:', reason, ident, result);
}

system_extension.setDebug(true);
console.log('basic: trying to install:', identifier);
const ret = system_extension.install(identifier, _eventHandler);
console.log('basic: install ret:', ret);
