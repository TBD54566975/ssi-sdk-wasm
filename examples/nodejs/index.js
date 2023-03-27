// import SSI from 'ssi-sdk-wasm'
import SSI from '../../dist/index.js';

async function run() {
    console.log(await SSI.makeDid());
    console.log(await SSI.simpleAdd(1,3));
}

run();