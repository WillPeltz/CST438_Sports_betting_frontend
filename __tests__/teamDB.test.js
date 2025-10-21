// Mock expo-sqlite before importing
jest.mock('expo-sqlite');
jest.mock('../database/userDB');

const {
    insertTeamManually,
    addTeamToFavs,
    getFavTeamNames,
    getTeamID,
    getFavTeamID
} = require('../database/teamDB');

const { getUserID } = require('../database/userDB');
const SQLite = require('expo-sqlite');

describe('Testing teamDB functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getTeamID should return team id when team exists', async () => {
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce({ team_id: 456 });
        
        const result = await getTeamID('Test Team');
        expect(result).toBe(456);
    });

    test('addTeamToFavs should insert favorite when user and team exist', async () => {
        getUserID.mockResolvedValueOnce(123);
        SQLite.mockDb.getFirstAsync.mockResolvedValueOnce({ team_id: 456 });
        
        await addTeamToFavs('testuser', 'Test Team');
        
        expect(SQLite.mockDb.runAsync).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO favorite'),
            456,
            123
        );
    });
});