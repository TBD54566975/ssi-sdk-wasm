const wasmFile = './main.wasm';

// TOOD: Something here:
// globalThis.require = require;
// globalThis.fs = require('browserfs')
// globalThis.TextEncoder = require('util').TextEncoder;
// globalThis.TextDecoder = require('util').TextDecoder;

// this.require = require;
// this.fs = require('browserfs')
// this.TextEncoder = require('util').TextEncoder;
// this.TextDecoder = require('util').TextDecoder;

// this.fs = require('browserfs')

// global.crypto ??= require("crypto");
const wasmExec = require('./wasm_exec');

async function init() {
  const go = new Go(); // Defined in wasm_exec.js
  const wasm = await fetch(wasmFile).then((response) => response.arrayBuffer());
  const result = await WebAssembly.instantiate(wasm, go.importObject);

  go.run(result.instance);

  return {
    makeDid: global.makeDid,
  };
}

export {
  init,
};