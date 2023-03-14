const getSSISDK = require('ssi-sdk-wasm');

console.log("NODE JS EXAMPLE:")

getSSISDK().then(makeDid => {
    console.log("DID:")
    console.log(makeDid())
})