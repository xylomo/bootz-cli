/**
 * Represents a Log Level
 */
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  VERBOSE = 'VERBOSE',
}

/**
 * Very simple logger
 */
export class Logger {

  constructor() { }

  info(message) {
    this.write(LogLevel.INFO, message);
  }

  warn(message) {
    this.write(LogLevel.INFO, message);
  }

  error(message) {
    this.write(LogLevel.INFO, message);
  }

  verbose(message) {
    this.write(LogLevel.INFO, message);
  }

  write(level: LogLevel, message: string) {
    process.stdout.write(`[${level}] ${message}\n`);
  }


}