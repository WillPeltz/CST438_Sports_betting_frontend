import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import loginPic from "../../assets/images/loginPic2.jpg";
import { getUserID, initializeDatabase } from "../../database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8080"  // android emulator
  : "http://localhost:8080";  // ios simulator

const GITHUB_CLIENT_ID = "Ov23liNkstCt53rnwRkV";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const router = useRouter();

  const discovery = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  };

  const redirectUri = 'myapp://';

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['user:email'],
      redirectUri: redirectUri,
      usePKCE: false,  // Disable PKCE
    },
    discovery
  );

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error("Database initialization error:", error);
        Alert.alert("Error", "An error occurred while initializing the database.");
      }
    };

    initializeDb();
  }, []);

  // Handle GitHub OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleGitHubCode(code);
    } else if (response?.type === 'error') {
      Alert.alert("Error", "GitHub login failed");
      setGithubLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      Alert.alert("Cancelled", "GitHub login was cancelled");
      setGithubLoading(false);
    }
  }, [response]);

  const handleGitHubCode = async (code: string) => {
    try {
      console.log("Got code from GitHub:", code);

      // Send code to backend to exchange for user info
      const backendResponse = await fetch(`${BACKEND_URL}/api/auth/github/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await backendResponse.json();
      console.log("Backend response:", data);

      if (data.success && data.email) {
        const userID = await getUserID(data.githubUsername);

        if (userID) {
          await AsyncStorage.setItem("username", data.githubUsername);
          Alert.alert("Welcome", "You are now logged in!");

          setTimeout(() => {
            router.push({
              pathname: "/favoriteTeams",
              params: { username: data.githubUsername }
            });
          }, 500);
        } else {
          Alert.alert("Error", "User not found.");
        }
      } else {
        Alert.alert("Error", data.error || "Failed to authenticate with GitHub");
      }

      setGithubLoading(false);
    } catch (error) {
      setGithubLoading(false);
      console.error("GitHub code exchange error:", error);
      Alert.alert("Error", `An error occurred during GitHub login: ${error}`);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting login to: ${BACKEND_URL}/api/users/login`);
      
      // Call Spring Boot backend
      const response = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      setLoading(false);

      if (response.ok && data.success) {
        // Store username for later use
        await AsyncStorage.setItem("username", username);
        Alert.alert("Welcome", "You are now logged in!");

        setTimeout(() => {
          router.push({
            pathname: "/favoriteTeams",
            params: { username }
          });
        }, 500);
      } else {
        Alert.alert("Error", data.message || "Incorrect username or password.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error", 
        `Could not connect to server at ${BACKEND_URL}. Make sure:\n\n1. Spring Boot backend is running\n2. You're using the correct IP address\n3. You're testing on Android emulator or device (not web browser)`
      );
    }
  };

  const handleGitHubLogin = async () => {
    console.log("Redirect URI:", redirectUri);
    setGithubLoading(true);
    await promptAsync();
  };

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={loginPic} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Sports Betting Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Login" onPress={handleLogin} />
        )}

        <View style={styles.divider}>
          <Text style={styles.dividerText}>OR</Text>
        </View>

        {githubLoading ? (
          <ActivityIndicator size="large" color="#333" />
        ) : (
          <TouchableOpacity 
            style={styles.githubButton} 
            onPress={handleGitHubLogin}
            disabled={!request}
          >
            <Text style={styles.githubButtonText}>Login with GitHub</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "80%",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  divider: {
    marginVertical: 20,
  },
  dividerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5
  },
  githubButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  githubButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});