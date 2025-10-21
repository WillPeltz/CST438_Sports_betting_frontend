// Mock expo-sqlite before importing userDB
jest.mock('expo-sqlite');

const {
    insertUser,
    verifyUserLogin,
    updatePassword,
    isUsernameAvailable,
    getUserID
} = require('../database/userDB');

const SQLite = require('expo-sqlite');

describe('Testing userDB functions', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('isUsernameAvailable should return false for existing user', async () => {
        // Mock that user exists
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce({ username: 'existingUser' });
        
        const result = await isUsernameAvailable('existingUser');
        expect(result).toBe(false);
    });

    test('isUsernameAvailable should return true for new user', async () => {
        // Mock that user doesn't exist
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce(null);
        
        const result = await isUsernameAvailable('newUser');
        expect(result).toBe(true);
    });

    test('getUserID should return user id when user exists', async () => {
        // Mock user with id
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce({ id: 123 });
        
        const result = await getUserID('testuser');
        expect(result).toBe(123);
    });

    test('getUserID should return null when user does not exist', async () => {
        // Mock user not found
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce(null);
        
        const result = await getUserID('nonexistent');
        expect(result).toBe(null);
    });
});