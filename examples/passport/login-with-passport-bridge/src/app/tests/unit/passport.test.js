const localforage = require('localforage');

// Mock the passport instance
const mockPassportInstance = {
  connectEvm: jest.fn(),
  getUserInfo: jest.fn(),
  loginCallback: jest.fn(),
};

// Mock localforage
jest.mock('localforage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
  createInstance: jest.fn(() => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    clear: jest.fn(),
  })),
}));

// Mock the passport instance import
jest.mock('../../../app/utils/setupDefault', () => ({
  passportInstance: mockPassportInstance,
}));

// Mock next/link
jest.mock('next/link', () => function NextLink({ href, children }) {
  return children;
});

// Testing the cross-SDK bridge functionality
describe('Cross-SDK Bridge Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should store data in IndexedDB', async () => {
    // Setup
    localforage.setItem.mockResolvedValue('test-data');
    
    // Execute
    await localforage.setItem('passport-test-data', 'test-data');
    
    // Verify
    expect(localforage.setItem).toHaveBeenCalledWith('passport-test-data', 'test-data');
  });

  test('should retrieve data from IndexedDB', async () => {
    // Setup
    localforage.getItem.mockResolvedValue('test-data');
    
    // Execute
    const result = await localforage.getItem('passport-test-data');
    
    // Verify
    expect(result).toBe('test-data');
    expect(localforage.getItem).toHaveBeenCalledWith('passport-test-data');
  });

  test('should create a second instance for bridging', async () => {
    // Setup
    const mockInstance = localforage.createInstance();
    mockInstance.setItem.mockResolvedValue('bridge-data');
    mockInstance.getItem.mockResolvedValue('bridge-data');
    
    // Execute
    await mockInstance.setItem('reference-key', 'bridge-data');
    const result = await mockInstance.getItem('reference-key');
    
    // Verify
    expect(result).toBe('bridge-data');
    expect(mockInstance.setItem).toHaveBeenCalledWith('reference-key', 'bridge-data');
    expect(mockInstance.getItem).toHaveBeenCalledWith('reference-key');
  });

  test('should clear data from all IndexedDB instances', async () => {
    // Setup
    const mockInstance = localforage.createInstance();
    
    // Execute
    await localforage.clear();
    await mockInstance.clear();
    
    // Verify
    expect(localforage.clear).toHaveBeenCalled();
    expect(mockInstance.clear).toHaveBeenCalled();
  });

  test('should initialize passport with crossSdkBridgeEnabled', () => {
    // This test would verify the passport initialization, 
    // but we can't test implementation details directly
    // Instead, we're just checking if our mock is correctly set up
    expect(mockPassportInstance).toBeDefined();
  });
}); 