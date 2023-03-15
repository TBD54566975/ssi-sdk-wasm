const esbuild = require('esbuild');


esbuild.buildSync({
  entryPoints: ['./src/testing.js'],
  platform: 'browser',
  format: 'iife',
  globalName: 'SSI',
  bundle: true,
  outfile: 'build/testing.js',
  define: {
    global: 'globalThis',
    window: 'globalThis'
  }
});