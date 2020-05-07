import webpack, { Configuration } from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { getServerConfig, getClientConfig } from './webpack';
import { ToolchainOptions } from './interfaces';

import { Logger } from './logger';

export const defaultToolchainOptions: ToolchainOptions = {
  isDev: process.env.NODE_ENV === 'development',
  outputDirectory: './dist',
  workingDirectory: process.cwd(),
  entries: {
    server: './src/platforms/server',
    client: './src/platforms/client/index.tsx',
  },
  tsConfig: 'tsconfig.json',
};

export class Toolchain {

  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  startDevServer(opts: ToolchainOptions = defaultToolchainOptions) {
    
    this.validateOptions(opts);

    // Force is dev for start dev server mode
    opts.isDev = true;
    
    const output = path.resolve(opts.workingDirectory as string, opts.outputDirectory as string);

    const start = async () => {

      const serverEntry = opts.entries.server;
      const serverConfig = getServerConfig({
        entries: serverEntry,
        outputDirectory: output,
        isDev: opts.isDev,
        isProduction: !opts.isDev,
        workingDirectory: opts.workingDirectory,
        tsConfig: opts.tsConfig,
        inspect: opts.inspect,
      });

      const clientEntry = opts.entries.client;
      const clientConfig = getClientConfig({
        entries: clientEntry,
        outputDirectory: output,
        isDev: opts.isDev,
        isProduction: !opts.isDev,
        workingDirectory: opts.workingDirectory,
        tsConfig: opts.tsConfig,
      });

      const clientWebpack = this.getWebpack(clientConfig);
      const serverWebpack = this.getWebpack(serverConfig);

      const clientDone = this.bindHooks(clientWebpack, 'client');
      const serverDone = this.bindHooks(serverWebpack, 'server');

      const devServer = express();

      devServer.use(webpackDevMiddleware(clientWebpack, {
        logLevel: 'silent',
        publicPath: clientConfig.output?.publicPath as any,
      }));

      devServer.use(webpackHotMiddleware(clientWebpack, {
        log: false,
      }));

      let server;
      devServer.use((req, res) => {
        try {
          return server.handle(req, res);
        } catch (err) {
          res.send(err);
        }
      });

      // Watch for changes and apply updates via HMR.
      // Hard reload server if it's not able to apply updates.
      serverWebpack.watch({}, (err, stats) => {
        if (!stats.hasErrors()) {

          if (server && server.hot) {

            // Can only check if the status is idle
            if (server.hot.status() !== 'idle') {
              return;
            }
            // Check for new modules and autoapply them
            server.hot.check(true)
            .then((updatedModules) => {
              if (updatedModules && updatedModules.length) {
                this.logger.info(`Updated ${updatedModules.length} modules`);
                requireServer();
              }
            }).catch(err => {
              if (server.hot.status().includes(['failed', 'abort'])) {
                this.logger.info('Could not apply updates, hard reloading server...');
                requireServer();
              } else {
                this.logger.error(`HMR update failed: ${err.message}`);
              }
            });
          }
        }
      });

      // Wrapper around requiring the server
      const requireServer = () => {
        const serverOutputPath = path.resolve(opts.outputDirectory as any, 'server.js');
        try {
          delete require.cache[require.resolve(serverOutputPath)];
          server = require(serverOutputPath).default;
        } catch (err) {
          this.logger.error(err);
          this.logger.error('failed to reload server');
        }
      }

      // Wait for the Webpack hooks to finish up
      await clientDone;
      await serverDone;

      // Load up the compiled server
      requireServer();

      // Listen on the port for dev
      const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
      devServer.listen(PORT);

      this.logger.info(`Development server listening on http://localhost:${PORT}`);

    }

    fs.emptyDirSync(output);
    start();

  }

  /**
   * Initiate a build for a `Bootz` app.
   */
  build(opts: ToolchainOptions = defaultToolchainOptions) {

    this.validateOptions(opts);

    const output = path.resolve(opts.workingDirectory as string, opts.outputDirectory as string);

    // Force isDev to be false since we are building
    opts.isDev = false;

    const start = () => {

      const serverEntry = opts.entries.server;
      const serverConfig = getServerConfig({
        entries: serverEntry,
        outputDirectory: output,
        isDev: opts.isDev,
        isProduction: !opts.isDev,
        workingDirectory: opts.workingDirectory,
        tsConfig: opts.tsConfig,
      });

      const clientEntry = opts.entries.client;
      const clientConfig = getClientConfig({
        entries: clientEntry,
        outputDirectory: output,
        isDev: opts.isDev,
        isProduction: !opts.isDev,
        workingDirectory: opts.workingDirectory,
        tsConfig: opts.tsConfig,
      });
  
      const clientWebpack = this.getWebpack(clientConfig);
  
      // Build the client first
      clientWebpack.run((clientCompileErrs, clientCompileStats) => {

        // Now build the server
        const serverWebpack = this.getWebpack(serverConfig);
        serverWebpack.run((err, stats) => {
          this.logger.info('Done!');
        });
    
      });
  
    };

    fs.emptyDirSync(output);
    start();

  }

  private bindHooks(compiler: webpack.Compiler, name: string): Promise<any> {
    return new Promise((resolve, reject) => {

      // Create tap to listen to
      compiler.hooks.done.tap(name, () => {});
      // Create callback for when hook done.
      compiler.hooks.done.tap(name, (stats) => {
        if (stats.hasErrors()) {
          this.logger.error(`Failed to compile ${name} \n\n ${JSON.stringify(stats.toJson('errors-only'), null, 2)}\n\n`);
        } else {
          resolve(stats);
        }
      });
    });
  }

  private getWebpack(config: Configuration): webpack.Compiler {
    let compiler;
    try {
      compiler = webpack(config);
    } catch (err) {
      this.logger.error(`failed to initialize Webpack: ${err.message}`);
      this.logger.error(err);
      process.exit(1);
    }
    return compiler;
  }

  private validateOptions(opts: ToolchainOptions) {
    
    if (opts.entries.client === '') {
      throw new Error('Client entry is missing');
    }
    
    if (opts.entries.server === '') {
      throw new Error('Server entry is missing');
    }

  }

}