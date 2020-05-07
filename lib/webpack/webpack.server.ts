import webpackMerge from 'webpack-merge';
import webpack, { Configuration } from 'webpack';
import webpackNodeExternals from 'webpack-node-externals';
import webpackBar from 'webpackbar';
import { getCommonConfig } from './webpack.common';

function getConfig(opts: any): Configuration {

  const entries = Array.isArray(opts.entries) ? opts.entries : [opts.entries];

  // Polyfills that are required after Babel 7.0.4+
  const polyfills = ['core-js/stable', 'regenerator-runtime/runtime'];

  const outputFilename = opts.filename || 'server.js';

  return {
    name: 'server',
    target: 'node',
    
    watch: opts.isDev,
    
    entry: opts.isDev
    ? [...polyfills, 'webpack/hot/poll?300', ...entries]
    : [...polyfills, ...entries],

    output: {
      path: opts.outputDirectory,
      filename: outputFilename,
      libraryTarget: 'commonjs',
    },

    externals: [
      '@loadable/component',
      webpackNodeExternals({
        whitelist: ['webpack/hot/poll?300']
      }),
    ],
    
    plugins: [

      // Fancy Progress Bar from nuxt
      new webpackBar({ name: 'server' }),

      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),

      opts.isDev && new webpack.HotModuleReplacementPlugin() as any, // Needed to satisfy ts :(
      
      opts.isDev && new webpack.NamedModulesPlugin(),
      
    ].filter(Boolean),

  }

}

export const getServerConfig = (opts) => {
  return webpackMerge(getCommonConfig(opts), getConfig(opts));
};

