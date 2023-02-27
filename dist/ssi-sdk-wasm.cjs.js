'use strict';

require('path');
require('fs');
var squarerPromise;

// function loadWebAssembly(fileName) {
//     const wasmFilePath = path.join(__dirname, fileName);
//     const bytes = fs.readFileSync(wasmFilePath);
//     return WebAssembly.compile(bytes)
//         .then(module => {return new WebAssembly.Instance(module) });

// };

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
    squarerPromise = loadWebAssembly('squarer.wasm').then(function (instance) {
      return instance.exports._Z7squareri;
    });
    return squarerPromise;
  }
}
module.exports = getSquarer;
