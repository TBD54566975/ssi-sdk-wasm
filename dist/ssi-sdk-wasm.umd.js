(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["ssi-sdk-wasm"] = factory());
})(this, (function () { 'use strict';

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
  var src = getSquarer;

  return src;

}));
