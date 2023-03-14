var _globalThis$crypto;
globalThis.fs = require('fs');
(_globalThis$crypto = globalThis.crypto) !== null && _globalThis$crypto !== void 0 ? _globalThis$crypto : globalThis.crypto = require("crypto");
require('./wasm_exec');
var go = new Go();
function loadWebAssembly() {
  if (this != undefined && this.window != undefined) {
    // TODO: fetch wasm locally:
    return fetch('http://127.0.0.1:8887/main.wasm').then(function (response) {
      return response.arrayBuffer();
    }).then(function (buffer) {
      return WebAssembly.compile(buffer);
    }).then(function (module) {
      var instance = new WebAssembly.Instance(module, go.importObject);
      go.run(instance);
      return globalThis["makeDid"];
    });
  } else {
    var path = require('path');
    var fs = require('fs');
    var filePath = path.join(__dirname, 'main.wasm');
    var buffer = fs.readFileSync(filePath);

    // const buffer = fs.readFileSync('./main.wasm');
    return WebAssembly.compile(buffer).then(function (module) {
      var instance = new WebAssembly.Instance(module, go.importObject);
      go.run(instance);
      return globalThis["makeDid"];
    });
  }
}
var sdkPromise;
function getSSISDK() {
  if (sdkPromise) {
    return sdkPromise;
  } else {
    sdkPromise = loadWebAssembly().then(function (makeDidFunc) {
      return makeDidFunc;
    });
    return sdkPromise;
  }
}
module.exports = getSSISDK;

// getSSISDK().then((sdk) => {
//   console.log("SDK:")
//   console.log(sdk)
//   console.log("CALL IT:")
//   console.log(sdk())
// })
