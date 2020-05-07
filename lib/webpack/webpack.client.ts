import webpackMerge from 'webpack-merge';
import webpack, { Configuration } from 'webpack';
import { prepareUrls } from 'react-dev-utils/WebpackDevServerUtils';
import LoadablePlugin from '@loadable/webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpackBar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';

import { getCommonConfig } from './webpack.common';

function getUrlParts(port) {
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const host = process.env.HOST || 'localhost';
  const urls = prepareUrls(protocol, host, port);
  return {
    port,
    protocol,
    host,
    urls
  };
}

function getConfig(opts: any): Configuration {

  const port = Number(opts.port) || 3000;

  const { protocol, host } = getUrlParts(port);

  let parsedEntries: any;

  // Polyfills that are required after Babel 7.0.4+
  const polyfills = [require.resolve('core-js/stable'), require.resolve('regenerator-runtime/runtime')];

  // Client entries
  let discovered
  if (typeof opts.entries === 'string' || Array.isArray(opts.entries)) { 
    discovered = { main: opts.entries }
  } else {
    throw new Error('Entries were not found');
  }

  parsedEntries = Object.keys(discovered).reduce((a, b) => {
    const entryPoints = Array.isArray(discovered[b]) ? discovered[b] : [discovered[b]];

    // Inject webpack hot middleware for dev
    a[b] = opts.isDev
    ? [...polyfills, require.resolve('webpack-hot-middleware/client'), ...entryPoints]
    : [...polyfills, ...entryPoints];


    return a;
  }, {});
  
  const getBaseConfig: any = (opts) => {
    return {

      name: 'client',
      entry: parsedEntries,
      target: 'web',
  
      output: {
        path: opts.outputDirectory,
        publicPath: opts.isDev ? `${protocol}://${host}:${port}/` : '/',
        pathinfo: opts.isDev,
        filename: opts.isDev ? `static/js/[name].js` : `static/js/[id].[chunkhash].js`,
        chunkFilename: opts.isDev ? `static/js/[name].[hash].js` : `static/js/[id].[chunkhash].js`,
      },
      
      optimization: {
        nodeEnv: opts.isDev ? 'development' : 'production', // NODE_ENV
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              minChunks: 2,
            },
            default: {
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      },
  
      plugins: [
  
        // Fancy Progress Bar from nuxt
        new webpackBar({ name: `client` }),
  
        new LoadablePlugin({
          writeToDisk: { filename: opts.outputDirectory },
        }),


        new FriendlyErrorsWebpackPlugin({}),
  
        opts.isDev && new webpack.NamedModulesPlugin(),
  
        opts.isDev && new webpack.HotModuleReplacementPlugin() as any,
  
      ].filter(Boolean),
  
    }

  }

  const baseCfg = getBaseConfig(opts);

  if (!opts.isDev) {
    baseCfg.optimization = {
      ...baseCfg.optimization,
      minimize: true,
      minimizer: [new TerserPlugin()],
      splitChunks: {
        name: 'vendor',
        chunks: 'initial',
      }
    }
  }

  return baseCfg;

}


/**
 * Get client configuration
 * @param opts Opts
 */
export const getClientConfig = (opts)=> {

  const webCfg = webpackMerge(getCommonConfig(opts), getConfig(opts));
  return webCfg;
};


