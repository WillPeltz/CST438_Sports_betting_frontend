// TO RUN BOTH TESTS:
// npx jest --runInBand "app/__tests__/UpcomingGames.test.tsx" "app/__tests__/FavoriteTeams.test.tsx"
// OR npm test

import React from 'react';
import renderer, { act } from 'react-test-renderer';

// Mock useRoute to provide a username param
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { username: 'testUser1' } }),
}));

// Mock database functions used by FavoriteTeams
jest.mock('../../database/db', () => ({
  addTeamToFavs: jest.fn(),
  removeTeamFromFav: jest.fn(),
  getFavTeamNames: jest.fn(() => Promise.resolve(['Atlanta Hawks'])),
  logDatabaseContents: jest.fn(),
}));

// Mock global fetch used to load teams
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify([{ id: 1, name: 'Atlanta Hawks', nickname: 'Hawks', logo: 'https://logo' }])),
  })
);

import FavoriteTeams from '../(tabs)/favoriteTeams';

describe('FavoriteTeams smoke test', () => {
  afterEach(() => {
    // reset mock calls between tests
    (global.fetch as jest.Mock).mockClear();
  });

  test('renders and fetches teams with mocks', async () => {
    let tree: renderer.ReactTestRenderer | undefined;

    await act(async () => {
      tree = renderer.create(<FavoriteTeams />);
      // allow useEffect and promises to resolve
      await Promise.resolve();
      await new Promise((res) => setImmediate(res));
    });

    expect(tree).toBeDefined();
    const json = tree!.toJSON();
    expect(json).toBeTruthy();
    const str = JSON.stringify(json);
    expect(str).toContain('Select Your Favorite Teams');
    expect((global.fetch as jest.Mock)).toHaveBeenCalled();
  });
});
