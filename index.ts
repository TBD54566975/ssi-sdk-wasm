const fs = require('fs');
const path = require('path');

// Load the WebAssembly module from file
const wasmFilePath = path.join(__dirname, 'hello.wasm');
const wasmBinary = fs.readFileSync(wasmFilePath);
const wasmModule = new WebAssembly.Module(wasmBinary);

// Export the `helloWorld()` function from the WebAssembly module
const wasmInstance = new WebAssembly.Instance(wasmModule);
const helloWorld = wasmInstance.exports.helloWorld;

// Export the `helloWorld()` function to NPM
module.exports = helloWorld;