(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path'), require('fs')) :
  typeof define === 'function' && define.amd ? define(['path', 'fs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["ssi-sdk-wasm"] = factory());
})(this, (function () { 'use strict';

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
  var src = getSquarer;

  return src;

}));
