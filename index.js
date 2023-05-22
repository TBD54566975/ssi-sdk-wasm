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
    createDIDIon: global.createDIDIon,
    resolveDID: global.resolveDID,
    parseJWTCredential: global.parseJWTCredential,
    createVerifiableCredential: global.createVerifiableCredential,
    createInputDescriptor: global.createInputDescriptor,
    verifyJWTCredential: global.verifyJWTCredential,
    createPresentationDefinition: global.createPresentationDefinition,
    createPresentationRequest: global.createPresentationRequest,
    createPresentationSubmission: global.createPresentationSubmission,
    verifyPresentationSubmission: global.verifyPresentationSubmission,
  };
}

async function createDIDKey() {
  await isWasmInitialized;
  return wasmExports.createDIDKey();
}

async function createDIDIon() {
  await isWasmInitialized;
  return wasmExports.createDIDIon();
}

async function resolveDID(didString) {
  await isWasmInitialized;
  return await wasmExports.resolveDID(didString);
}

async function createVerifiableCredential(issuerDID, issuerDIDPrivateKey, subjectJSONString) {
  await isWasmInitialized;
  return wasmExports.createVerifiableCredential(issuerDID, issuerDIDPrivateKey, subjectJSONString);
}

async function parseJWTCredential(credJWT) {
  await isWasmInitialized;
  return wasmExports.parseJWTCredential(credJWT);
}

async function verifyJWTCredential(credJWT, publicKeyBase58) {
  await isWasmInitialized;
  return wasmExports.verifyJWTCredential(credJWT, publicKeyBase58)
}

async function createInputDescriptor(purpose, constraintsFieldPath, constraintsFieldID) {
  await isWasmInitialized;
  return wasmExports.createInputDescriptor(purpose, constraintsFieldPath, constraintsFieldID)
}

async function createPresentationDefinition(presentationDefinitionInput) {
  await isWasmInitialized;
  return wasmExports.createPresentationDefinition(presentationDefinitionInput)
}

async function createPresentationRequest(presentationDefinitionInput, signerDID, signerPrivateKey, holderDID) {
  await isWasmInitialized;
  return wasmExports.createPresentationRequest(presentationDefinitionInput, signerDID, signerPrivateKey, holderDID)
}


async function createPresentationSubmission(presentationDefinitionInput, signerDID, signerPrivateKey, vcJWT) {
  await isWasmInitialized;
  return wasmExports.createPresentationSubmission(presentationDefinitionInput, signerDID, signerPrivateKey, vcJWT)
}

async function verifyPresentationSubmission(presentationDefinitionInput, verifierDID, verifierPrivateKey, presentationSubmissionJWT) {
  await isWasmInitialized;
  return wasmExports.verifyPresentationSubmission(presentationDefinitionInput, verifierDID, verifierPrivateKey, presentationSubmissionJWT)
}

module.exports = {
  createDIDKey,
  createDIDIon,
  resolveDID,
  parseJWTCredential,
  createVerifiableCredential,
  verifyJWTCredential,
  createInputDescriptor,
  createPresentationDefinition,
  createPresentationRequest,
  createPresentationSubmission,
  verifyPresentationSubmission,
};