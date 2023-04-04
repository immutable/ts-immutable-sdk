/** Standard SDK Configuration interface */
export type Configuration = {
  env: 'production' | 'dev';
};

const defaultConfig: Configuration = {
  env: 'dev',
};

/**
 * Base class from which all SDK classes inherit a common interface
 * with default lifecycle implementations
 */
export abstract class SDK {
  constructor(protected config = defaultConfig) {
    this.config = config;
    this.connect();
  }

  /**
   * Lifecycle: Use to bootstrap initialisation
   */
  abstract connect(): void;

  /** Utility: Use to print logs in console */
  log(...args: unknown[]): void {
    console.log(`${this.constructor.name}:`, ...args);
  }

  /** Utility: Getter to protected config object */
  getConfig(): Configuration {
    return this.config;
  }
}
