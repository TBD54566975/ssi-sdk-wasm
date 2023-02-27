'use strict';

var squarerPromise;
function loadWebAssembly(fileName) {
  return fetch(fileName).then(function (response) {
    return response.arrayBuffer();
  }).then(function (buffer) {
    return WebAssembly.compile(buffer);
  }).then(function (module) {
    return new WebAssembly.Instance(module);
  });
}
function getSquarer() {
  if (squarerPromise) {
    return squarerPromise;
  } else {
    squarerPromise = loadWebAssembly('https://github.com/TBD54566975/ssi-sdk-wasm/blob/main/src/squarer.wasm?raw=true').then(function (instance) {
      return instance.exports._Z7squareri;
    });
    return squarerPromise;
  }
}
getSquarer();
module.exports = getSquarer;
