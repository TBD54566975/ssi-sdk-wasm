const assert = require('assert');
const SSI = require('..');

(async () => {
  const did = await SSI.makeDid();

  assert.equal(did.id.includes("did"), true)
  console.log('Result from WASM function:', did);
})();