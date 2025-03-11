// Setup file for Jest tests
require('@testing-library/jest-dom');

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to suppress logs during testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}; 