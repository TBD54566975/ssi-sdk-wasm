const path = require('path');
const fetch = require('isomorphic-fetch');

global.crypto ??= require("crypto");
require('./wasm_exec');

const wasmFilePath = path.join(__dirname, 'main.wasm');

let wasmExports;
let isWasmInitialized = initWasm();

async function initWasm() {
  const wasmFile = (typeof window === 'undefined')
    ? require('fs').readFileSync(wasmFilePath)
    : await fetch(wasmFilePath).then((response) => response.arrayBuffer());

  const go = new Go();
  const wasmModule = await WebAssembly.compile(wasmFile);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);

  go.run(wasmInstance);
  wasmExports = {
    simpleAdd: global.simpleAdd,
    generateKey: global.generateKey,
    makeDid: global.makeDid,
    resolveDID: global.resolveDID,
    parseJWTCredential: global.parseJWTCredential,
  };
}

async function simpleAdd(a, b) {
  await isWasmInitialized;
  return wasmExports.simpleAdd(a, b);
}

async function generateKey(keyType) {
  await isWasmInitialized;
  return wasmExports.generateKey(keyType);
}

async function makeDid() {
  await isWasmInitialized;
  return wasmExports.makeDid();
}

async function resolveDID(didString) {
  await isWasmInitialized;
  return wasmExports.resolveDID(didString);
}

async function parseJWTCredential(credJWT) {
  await isWasmInitialized;
  return wasmExports.parseJWTCredential(credJWT);
}


module.exports = {
  simpleAdd,
  generateKey,
  makeDid,
  resolveDID,
  parseJWTCredential,
};