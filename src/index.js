let squarer;
let squarerPromise;

function loadWebAssembly(fileName) {
    return fetch(fileName)
      .then(response => response.arrayBuffer())
      .then(buffer => WebAssembly.compile(buffer))
      .then(module => {return new WebAssembly.Instance(module) });
  };

function getSquarer() {
    if (squarerPromise) {
      return squarerPromise;
    } else {
      squarerPromise = loadWebAssembly('http://127.0.0.1:8887/squarer.wasm')
        .then(instance => {
          return instance.exports._Z7squareri;
        });
      return squarerPromise;
    }
  }

  getSquarer()
module.exports = getSquarer;