#!/usr/bin/env node

import { Command} from 'commander';
import path from 'path';
import fs from 'fs';
import deepMerge from 'deepmerge';

import { Toolchain, ToolchainOptions, defaultToolchainOptions } from '../lib';
import { CLIHelpers } from '../lib/cli';

import { Logger } from '../lib/logger';

const logger = new Logger();

function bootstrap() {

  const program = new Command();
  
  program
    .usage('<command> [options]')
    .helpOption('-h, --help', 'Output usage information.');

  program
    .command('dev')
    .description('Run a Bootz server in development mode')
    .option('-o, --output [outputDirectory]', 'Output directory', 'dist')
    .option('-p, --port [port]', 'Port to listen on', '3000')
    .option('-i, --inspect', 'Enable Node debugging', false)
    .option('-w, --working-dir [cwd]', 'Current working directory', '$PWD')
    .option('-c, --config [config]', 'Configuration file for Bootz', 'bootz.config.ts')
    .action((command: Command) => {
      const opts = parseOptions(command);
      const instance = new Toolchain();
      instance.startDevServer(opts);
    });

  program
    .command('build')
    .description('Build a Bootz project')
    .option('-o, --output [outputDirectory]', 'Output directory', 'dist')
    .option('-w, --working-dir [cwd]', 'Current working directory', '$PWD')
    .option('-c, --config [config]', 'Configuration file for Bootz', 'bootz.config.ts')
    .action((command: Command) => {
      const opts = parseOptions(command);
      const instance = new Toolchain();
      instance.build(opts);
    });

  program
  .command('create <name>')
  .description('Create a Bootz app')
  .option('-o, --output [outputDirectory]', 'Output directory', 'dist')
  .action((name: string, command: Command) => {
    const instance = new CLIHelpers();
    instance.createApp(name);
  });

  program
  .command('eject')
  .description('Eject a Bootz app')
  .action((command: Command) => {
    const instance = new CLIHelpers();
    instance.eject();
  });
  
  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }

}

function parseOptions(command: Command): ToolchainOptions {

  const workingDirectory = !!command.cwd ? command.cwd : process.cwd();
  const configFileOpt = !!command.config ? command.config : 'bootz.config.ts';

  const configFilePath = path.resolve(workingDirectory, configFileOpt);
  
  let configFromFile: ToolchainOptions;
  if (fs.existsSync(configFilePath)) {
    // Config file exists, try to require it
    try {
      configFromFile = require(configFilePath).default;
      // Merge the defaults with the file configuration
      configFromFile = deepMerge(defaultToolchainOptions, configFromFile);
      logger.info(`Bootz configuration found, using configuration file: ${configFilePath}`);
    } catch (err) {
      logger.warn(`There was an error trying to read your configuration file, using defaults: ${err.message}`);
      configFromFile = defaultToolchainOptions;
    }
  } else {
    logger.warn('Bootz configuration file not found');
    // Config file doesn't exist.. use defaults
    configFromFile = defaultToolchainOptions;
  }

  // Order of configuration assignment (higher is better)
  // 1. CLI Args
  // 2. Config file
  // 3. Sensible defaults

  const isDev = !!command.production ? command.production : configFromFile.isDev;
  const distPath = !!command.outputDirectory ? command.outputDirectory : configFromFile.outputDirectory;

  // Parse client entries
  const clientEntries = typeof configFromFile.entries.client === 'string' ? [configFromFile.entries.client] : configFromFile.entries.client;
  const parsedClientEntries = clientEntries.map((entry) => {
    return path.resolve(workingDirectory, entry);
  });
  
  // Parse server entries
  const serverEntries = typeof configFromFile.entries.server === 'string' ? [configFromFile.entries.server] : configFromFile.entries.server;
  const parsedServerEntries = serverEntries.map((entry) => {
    return path.resolve(workingDirectory, entry);
  });

  // Parse tsconfig file
  const tsConfigFileName = !!command.tsconfig ? command.tsconfig : configFromFile.tsConfig;
  const tsConfig = path.resolve(workingDirectory, tsConfigFileName);
  
  // Parse inspect
  const inspect = !!command.inspect ? command.inspect : false;
  const configuration = {
    outputDirectory: distPath,
    isDev,
    workingDirectory,
    entries: {
      server: parsedServerEntries,
      client: parsedClientEntries,
    },
    tsConfig,
    inspect,
  };

  return configuration;

}

bootstrap();
