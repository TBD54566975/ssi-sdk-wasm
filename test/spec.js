const assert = require('assert');
const getSSISDK = require('..');

getSSISDK().then(makeDid => {
  let did = makeDid()

  console.log("MAKE DID:")
  console.log(did)
  
  assert.equal(did.id.includes("did"), true)
});