const assert = require('assert');
const loadWasm = require('..');

(async () => {
  const wasmExports = await loadWasm();
  const did = wasmExports.makeDid();

  assert.equal(did.id.includes("did"), true)
  console.log('Result from WASM function:', did);
})();