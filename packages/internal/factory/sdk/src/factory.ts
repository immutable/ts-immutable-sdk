import { FactoryConfiguration } from 'config';

/**
 * Represents a factory
 */
export class Factory {
  private config: FactoryConfiguration;

  constructor(config: FactoryConfiguration) {
    this.config = config;
  }
}
