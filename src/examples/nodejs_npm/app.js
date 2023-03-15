const loadWasm = require('ssi-sdk-wasm');

console.log("NODE JS EXAMPLE:")

loadWasm().then(wasmExports => {
    console.log("DID:")
    console.log(wasmExports.makeDid())
})
