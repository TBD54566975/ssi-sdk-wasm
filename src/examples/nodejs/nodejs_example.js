const crypto = require('crypto');

globalThis.fs = require('fs');
globalThis.crypto = {
  getRandomValues(b) {
    crypto.randomFillSync(b);
  }
};

// Slightly changed wasm_exec that uses globalThis for golang wasm <-> nodejs communication
require('../../wasm_exec');
const go = new Go();

WebAssembly.instantiate(fs.readFileSync("../../main.wasm"), go.importObject)
  .then((result) => {
    go.run(result.instance);
    
    const didResult = globalThis["makeDid"]();
    console.log("DID RESULT:")
    console.log(didResult)

    return didResult

  })
  .catch((err) => {
    console.error(err);
  });
