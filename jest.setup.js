// Mock Alert
global.Alert = {
  alert: jest.fn(),
};

// Setup other global mocks if needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};