import { apiCall } from '../ApiScripts.js'; 

// Mocking global.fetch
global.fetch = jest.fn();

describe('apiCall function', () => {
  test('should call fetch with correct URL and pass the response data to setJsonResponse', async () => {
    const mockResponse = { response: [{ id: 1, name: 'Test Team' }] };
    const mockSetJsonResponse = jest.fn();

    // Mock fetch to return a resolved promise
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const url = 'https://api.example.com/teams';
    
    // Call your apiCall function
    await apiCall(url, mockSetJsonResponse);

    // Check if fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(url);
    
    // Check if setJsonResponse was called with the correct data
    expect(mockSetJsonResponse).toHaveBeenCalledWith(mockResponse);
  });
});