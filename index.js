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
    createDIDKey: global.createDIDKey,
    resolveDID: global.resolveDID,
    parseJWTCredential: global.parseJWTCredential,
    createVerifiableCredential: global.createVerifiableCredential,
  };
}

async function createDIDKey() {
  await isWasmInitialized;
  return wasmExports.createDIDKey();
}

async function resolveDID(didString) {
  await isWasmInitialized;
  return wasmExports.resolveDID(didString);
}

async function createVerifiableCredential(issuerDID, issuerDIDPrivateKey, subjectJSONString) {
  await isWasmInitialized;
  return wasmExports.createVerifiableCredential(issuerDID, issuerDIDPrivateKey, subjectJSONString);
}

async function parseJWTCredential(credJWT) {
  await isWasmInitialized;
  return wasmExports.parseJWTCredential(credJWT);
}

module.exports = {
  createDIDKey,
  resolveDID,
  parseJWTCredential,
  createVerifiableCredential,
};