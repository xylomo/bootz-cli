import { Configuration } from "webpack";
import forkTSCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';

// CSS/SCSS Plugins
import ExtractCssChunksWebpackPlugin from 'extract-css-chunks-webpack-plugin';
import cssNano from 'cssnano';
import autoprefixer from 'autoprefixer';

export interface WebpackOverrides {
  contextDirectory: string;
}

let bootzNodeModulesPath = '../../node_modules'
if (__dirname.indexOf('dist') !== -1) {
  bootzNodeModulesPath = '../../../node_modules';
}

function getConfig(opts: any): Configuration {

  const assetHash = opts.isDev ? '[name].[hash].[ext]' : '[hash].[ext]';

  const defaultCommonConfig: Configuration = {
    mode: opts.isDev ? 'development' : 'production',
    bail: !opts.isDev,
    devtool: opts.isDev ? 'inline-source-map' : undefined as any,
    context: opts.workingDirectory || process.cwd(),
    output: {
      path: opts.outputDirectory,
      publicPath: '/'
    },
    resolve: {
      modules: [
        // Resolve from cwd node_modules folder
        path.resolve(opts.workingDirectory, 'node_modules'),
        // Resolve from Bootz node_modules folder
        path.resolve(__dirname, bootzNodeModulesPath),
      ],
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      alias: {
        'webpack/hot/poll': require.resolve('webpack/hot/poll'),
      },
    },
    resolveLoader: {
      modules: [
        // Resolve from Bootz node_modules folder
        path.resolve(__dirname, bootzNodeModulesPath),
        // Resolve from cwd node_modules folder
        path.resolve(opts.workingDirectory, 'node_modules'),
      ],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)?$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: opts.isDev,
            presets: [
              require.resolve("@babel/preset-env"),
              require.resolve("@babel/preset-typescript"),
              require.resolve("@babel/preset-react"),
            ],
            plugins: [
              require.resolve("@loadable/babel-plugin"),
              require.resolve("@babel/plugin-syntax-dynamic-import"),
            ],
          }
        },
        {
          test: /\.css?$/,
          use: [
            {
              loader: ExtractCssChunksWebpackPlugin.loader,
              options: {
                hmr: opts.isDev,
              },
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                modules: {
                  mode: 'local',
                  localIdentName: opts.isDev ? '[local]__[hash:base64:5]' : '[hash:base64:8]',
                },
                sourceMap: opts.isDev,
              },
            },
            opts.isProduction && {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [
                  autoprefixer,
                  cssNano,
                ]
              }
            }
          ].filter(Boolean),
        },
        {
          test: /\.(scss|sass)?$/,
          use: [
            {
              loader: ExtractCssChunksWebpackPlugin.loader,
              options: {
                hmr: opts.isDev,
              },
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                modules: {
                  mode: 'local',
                  localIdentName: opts.isDev ? '[local]__[hash:base64:5]' : '[hash:base64:8]',
                },
                sourceMap: opts.isDev,
              },
            },
            opts.isProduction && {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [
                  autoprefixer,
                  cssNano,
                ]
              }
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sassOptions: {
                  minimize: !opts.isDev,
                }
              }
            }
          ].filter(Boolean),
        },

        {
          oneOf: [

            // Inline smaller images
            // Fallback is to do url
            {
              test: /\.(bmp|gif|jpg|jpeg|png|svg)$/,
              loader: 'url-loader',
              options: {
                name: assetHash,
                limit: 4096,        // 4kb
                fallback: 'file-loader',
                outputPath: 'static/media/',
                publicPath: '/static/media/',
              }
            },

            // Fallback for anything else
            {
              exclude: /\.(js|ts|tsx|jsx|css|sass|scss)$/,
              loader: 'url-loader',
              options: {
                outputPath: 'static/assets/',
                publicPath: '/static/assets/',
              }
            }

          ]
        }
      ]
    },
    plugins: [
      new forkTSCheckerWebpackPlugin({
        async: true,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: opts.tsConfig,
        silent: true,
      }),

      new ExtractCssChunksWebpackPlugin({
        filename: opts.isDev ? 'static/css/[name].css' : 'static/css/[id].[chunkhash].css',
        chunkFilename: opts.isDev ? 'static/css/[id].[chunkhash].css' : 'static/css/[hash].css',
      }),

    ]
  }
  return defaultCommonConfig;
}

export const getCommonConfig = (opts): Configuration => {
  return getConfig(opts);
};