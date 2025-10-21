import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../(tabs)/login'; 
import { Alert } from 'react-native';

// --- Mocks ---

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
}));

// Mock React Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'), // Import and retain default behavior
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock global.fetch
global.fetch = jest.fn() as jest.Mock;

// Mock Alert
jest.spyOn(Alert, 'alert');

// --- Tests ---

describe('LoginScreen', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an alert if username or password is blank', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    // Only fill out username
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Login'));

    // Check that Alert was called with the correct message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please enter both username and password.',
      );
    });

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles successful login and navigates to FavoriteTeams', async () => {
    // Mock a successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, username: 'testuser' }),
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    // Fill out the form
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    // Wait for async operations to complete
    await waitFor(() => {
      // Check that navigation was called correctly
      expect(mockNavigate).toHaveBeenCalledWith('favoriteTeams', {
        username: 'testuser',
      });
    });

    // Check that welcome alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Welcome',
      'You are now logged in as testuser!',
    );
  });

  it('shows an alert for invalid credentials (401 Unauthorized)', async () => {
    // Mock a failed fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Invalid username or password'),
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      // Check that the correct error alert was shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid username or password',
      );
    });

    // Ensure navigation did not happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an alert for a network connection error', async () => {
    // Mock fetch to reject (simulating network error)
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch'),
    );

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      // Check that the connection error alert was shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Could not connect to the server.',
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});