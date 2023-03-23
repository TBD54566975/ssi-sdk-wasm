const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);


global.crypto ??= require("crypto");
const wasmExec = require('./wasm_exec');
const wasmFile = './main.wasm';

async function init() {
  const go = new Go(); // Defined in wasm_exec.js
  const wasm = await readFile(wasmFile);
  const result = await WebAssembly.instantiate(wasm, go.importObject);

  go.run(result.instance);

  return {
    makeDid: global.makeDid,
  };
}

module.exports = {
  init,
};