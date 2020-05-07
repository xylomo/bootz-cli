
import { ToolchainOptions } from 'bootz';
const config: ToolchainOptions = {
  
  isDev: true,

  outputDirectory: 'dist',

  entries: {

    server: './src/platforms/server',

    client: './src/platforms/client/index.tsx',

  },

  tsConfig: 'tsconfig.json',

}

export default config;