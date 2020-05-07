import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import os from 'os';

import { Logger } from './logger';

export class CLIHelpers {

  private logger: Logger;

  constructor () {
    this.logger = new Logger();
  }

  async createApp(name: string) {
    
    let _templateDir = '../template'

    // Format for built version of Bootz
    if (__dirname.indexOf('dist') !== -1) {
      _templateDir = '../../template';
    }

    const outputDirectory = path.resolve(process.cwd(), name);
    const templateDirectory = path.resolve(__dirname, _templateDir);

    // Check to make sure that the directory doesn't already exist.
    if (fs.existsSync(outputDirectory)) {
      this.logger.error('Output directory exists. Bootz does not overwrite folders that already exist. Aborting...\n');
      process.exit(1);
    }

    if (!fs.existsSync(templateDirectory)) {
      this.logger.error('Unable to find the template. Aborting...\n');
      process.exit(1);
    }
    
    this.logger.info(`Creating Bootz app into ${outputDirectory}`);

    try {
      fs.copySync(templateDirectory, outputDirectory);
    } catch (err) {
      this.logger.error(`Failed to copy template: ${err.message}`);
    }

    this.logger.info('Installing dependencies');
    
    execSync('npm install', { cwd: outputDirectory });

    this.logger.info('Done!');
    
  }

  async eject() {

    this.logger.info('Ejecting this app from Bootz');

    let _toolDir = '../tools';
    let _libDir = '../lib';
    let _tsConfig = '../tsconfig.json';
    let _pkgFile = '../package.json';
    
    // Format for built version of Bootz
    if (__dirname.indexOf('dist') !== -1) {
      _toolDir = '../../tools';
      _libDir = '../../lib';
      _tsConfig = '../../tsconfig.json';
      _pkgFile = '../../package.json';
    }
    
    const pkgFile = path.resolve(__dirname, _pkgFile);

    const bootzToolsDir = path.resolve(__dirname, _toolDir);
    const bootzLibDir = path.resolve(__dirname, _libDir);
    const bootzTSConfig = path.resolve(__dirname, _tsConfig);

    const appPkgFile = path.resolve(process.cwd(), 'package.json');
  
    const appToolsDir = path.resolve(process.cwd(), 'tools');
    const appLibDir = path.resolve(appToolsDir, 'lib');
    const appDevTSConfig = path.resolve(process.cwd(), 'tsconfig.dev.json');

    if (!fs.existsSync(appPkgFile)) {
      this.logger.error('Could not find package.json in the current directory.');
      process.exit(1);
    }

    if (!fs.existsSync(pkgFile)) {
      this.logger.error('Could not find package.json within Bootz. You may need to reinstall Bootz.');
      process.exit(1);
    }

    const pkg = require(pkgFile);
    const appPkg = require(appPkgFile);

    // Compare the App package json to the Bootz for the deps.
    const depResults: any[] = await this.compareDependencies(pkg.dependencies, appPkg.dependencies);
    const devDepResults: any[] = await this.compareDependencies(pkg.devDependencies, appPkg.devDependencies);

    // Copy all deps from Bootz to dev deps into app
    depResults.forEach((v) => {
      appPkg.devDependencies[v.dependency] = v.version;
    });

    devDepResults.forEach((v, k) => {
      appPkg.devDependencies[v.dependency] = v.version;
    });

    // Update commands
    appPkg.scripts['dev'] = 'NODE_ENV=development ts-node --project tsconfig.dev.json ./tools/dev.ts';
    appPkg.scripts['build'] = 'NODE_ENV=production ts-node --project tsconfig.dev.json ./tools/build.ts';
    // Remove eject
    try {
      delete appPkg.scripts['eject'];
    } catch (err) { /* Silently continue */ }

    // Add TS-Node options
    appPkg['ts-node'] = {
      transpileOnly: true,
      compilerOptions: {
        module: 'commonjs'
      }
    };

    this.logger.info('Copying Bootz files to app');

    // Ignore the CLI helpers since they are unnecessary once ejected
    const blackListLib = 'cli.ts';
    fs.copySync(bootzLibDir, appLibDir, {
      filter: (src, dest): boolean => {
        return src.indexOf(blackListLib) === -1;
      },
    });
    fs.copySync(bootzToolsDir, appToolsDir);
    fs.copyFileSync(bootzTSConfig, appDevTSConfig);

    this.logger.info('Updating package.json with devDependencies');

    this.logger.info('Running "npm install"');

    fs.writeFileSync(appPkgFile, JSON.stringify(appPkg, null, 2) + os.EOL);

    execSync('npm install', { cwd: process.cwd() });

    this.logger.info('Feel free to delete your Bootz configuration file. It isn\'t needed anymore.')
    this.logger.info('Done! You will be missed');

  }

  private compareDependencies(a, b = {}): Promise<any> {

    // Things to explicitly ignore
    const blacklist = ['commander'];
    
    return new Promise((resolve, reject) => {
      const missing: any[] = [];
      Object.keys(a).forEach((k) => {
        const dep = Object.keys(b).find((bk) => k === bk);
        if (!dep && !blacklist.includes(k)) {
          missing.push({
            dependency: k,
            version: a[k],
          });
        }
      });
      resolve(missing);
    });

  }

}