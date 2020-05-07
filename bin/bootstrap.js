#!/usr/bin/env node

// Register for Typescript
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  }
});

try {
  // Require from dist
  require('../dist/bin/bootz');
} catch (err) {
  // Try to require locally
  require('./bootz');
}