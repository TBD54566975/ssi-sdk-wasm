const esbuild = require('esbuild');
const path = require('path');

// Build for Node.js
esbuild
  .build({
    entryPoints: [path.resolve(__dirname, 'src/index.js')],
    outfile: path.resolve(__dirname, 'dist', 'index.js'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Build for browsers
esbuild
  .build({
    entryPoints: [path.resolve(__dirname, 'src/index.browser.js')],
    outfile: path.resolve(__dirname, 'dist', 'index.browser.js'),
    bundle: true,
    platform: 'browser',
    format: 'esm',
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });