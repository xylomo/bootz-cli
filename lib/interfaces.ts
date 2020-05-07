// Interfaces for the Toolchain

/**
 * Represents options for the toolchain
 */
export interface ToolchainOptions {

  /**
   * Development mode
   */
  isDev?: boolean;

  /**
   * Enable debugging
   */
  inspect?: boolean;

  /**
   * Output directory. Does not have to be absolute.
   */
  outputDirectory?: string;

  /**
   * Working directory. Should be an absolute path.
   */
  workingDirectory?: string;

  /**
   * Entries for the app
   */
  entries: {

    /**
     * Client entries for Webpack. Does not have to be absolute.
     */
    client: string | string[];

    /**
     * Server entries for Webpack. Does not have to be absolute.
     */
    server: string | string[];

  },
  
  /**
   * Typescript configuration file. Does not have to be absolute
   */
  tsConfig?: string;

}
