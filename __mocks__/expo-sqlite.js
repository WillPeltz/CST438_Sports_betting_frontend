// Mock database for testing
const mockDb = {
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
};

const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);

module.exports = {
  openDatabaseAsync,
  mockDb, // Export for test access
};