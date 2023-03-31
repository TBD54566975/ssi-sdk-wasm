// import SSI from 'ssi-sdk-wasm'
import SSI from '../../dist/index.js';

async function run() {
    const did = await SSI.createDIDKey();
    const vc = await SSI.createVerifiableCredential(did.didDocument.id, did.privateKeyBase58, JSON.stringify({ id: did.didDocument.id, name: 'John Doe' }));
    console.log("Created VC:")
    console.log(vc)
}

run();