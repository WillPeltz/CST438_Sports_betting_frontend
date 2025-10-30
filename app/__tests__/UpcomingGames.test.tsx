// TO RUN BOTH TESTS:
// npx jest --runInBand "app/__tests__/UpcomingGames.test.tsx" "app/__tests__/FavoriteTeams.test.tsx"
// OR npm test

import React from 'react';
import renderer, { act } from 'react-test-renderer';

// Mock AsyncStorage to return a test username
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('testUser1')),
}));

// Mock database functions used by UpcomingGames
jest.mock('../../database/db', () => ({
  getAllFavTeamInfo: jest.fn(() => Promise.resolve([[1, 'Atlanta Hawks', 'Hawks', 'https://logo']])),
  logDatabaseContents: jest.fn(),
}));

// Mock ApiScripts.callGamesByDate to return one game
jest.mock('../ApiScripts', () => ({
  callGamesByDate: jest.fn(() =>
    Promise.resolve([
      {
        id: 'g1',
        // component expects a Date instance (calls toLocaleDateString)
        date: new Date(),
        homeTeam: { name: 'Atlanta Hawks', nickname: 'Hawks', logo: 'https://logo' },
        awayTeam: { name: 'Boston Celtics', nickname: 'Celtics', logo: 'https://logo2' },
      },
    ])
  ),
}));

// Mock navigation hooks used inside the component
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({}),
  // Don't auto-run focus effects in tests to avoid re-render loops.
  useFocusEffect: () => undefined,
}));
import UpcomingGames from '../(tabs)/UpcomingGames';

describe('UpcomingGames smoke test', () => {
  test('renders and fetches games with mocks', async () => {
    let tree: renderer.ReactTestRenderer | undefined;

    await act(async () => {
      tree = renderer.create(<UpcomingGames />);
      // wait a tick for useEffect chains
      await Promise.resolve();
      await new Promise((res) => setImmediate(res));
    });

    expect(tree).toBeDefined();
    const json = tree!.toJSON();
    expect(json).toBeTruthy();
    const str = JSON.stringify(json);
    expect(str).toContain('Upcoming Games for Your Teams');

    // Ensure the mocked API was called
    const api = require('../ApiScripts');
    expect(api.callGamesByDate).toHaveBeenCalled();
  });
});
