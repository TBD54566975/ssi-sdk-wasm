const assert = require('assert');
const getSquarer = require('..');

getSquarer().then(squarer => {
  assert(squarer(5) === 25, "squarer(5) should be 25")
});