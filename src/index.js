const fs = require('fs');
const path = require('path');
const util = require('util');

global.crypto ??= require("crypto");

// Include the wasm_exec.js file
require('./wasm_exec');

const wasmFilePath = path.join(__dirname, 'main.wasm');
const readFile = util.promisify(fs.readFile);

async function loadWasm() {
  const wasmFile = await readFile(wasmFilePath);

  // Instantiate the Go object
  const go = new Go();

  // Compile and instantiate the WASM module with the Go import object
  const wasmModule = await WebAssembly.compile(wasmFile);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);

  // Run the Go instance
  go.run(wasmInstance);

  // Access the JavaScript function created in the Go code
  const makeDid = global.makeDid;

  return {
    makeDid
  };
}

module.exports = loadWasm;

// For Testing
// (async () => {
//     const wasmExports = await loadWasm();
//     const result = wasmExports.makeDid();
//     console.log('Result from WASM function:', result);
//   })();