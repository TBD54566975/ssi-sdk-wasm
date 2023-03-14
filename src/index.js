globalThis.fs = require('fs');
globalThis.crypto ??= require("crypto");

require('./wasm_exec');
const go = new Go();

function loadWebAssembly() {
  if (this != undefined && this.window != undefined) {
    // TODO: fetch wasm locally:
    return fetch('http://127.0.0.1:8887/main.wasm')
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.compile(buffer))
    .then(module => {
      let instance = new WebAssembly.Instance(module, go.importObject)
      go.run(instance);
      return globalThis["makeDid"]
    });
  } else {
    const path = require('path');
    const fs = require('fs');

    const filePath = path.join(__dirname, 'main.wasm');
    const buffer = fs.readFileSync(filePath);
    
    // const buffer = fs.readFileSync('./main.wasm');
    return WebAssembly.compile(buffer)
      .then(module => {
        let instance = new WebAssembly.Instance(module, go.importObject);
        go.run(instance);
        return globalThis["makeDid"];
      });
  }
};


let sdkPromise;

function getSSISDK() {
  if (sdkPromise) {
    return sdkPromise;
  } else {
    sdkPromise = loadWebAssembly()
      .then(makeDidFunc => {
        return makeDidFunc
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