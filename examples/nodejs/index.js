import {init} from '../../dist/index.js';

(async () => {
  const { makeDid } = await init();
  console.log(makeDid())
})();