import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ImageBackground,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { insertUser, isUsernameAvailable } from "../../database/db";
import accountPic from "../../assets/images/accountCreationPic.jpg";

const BACKEND_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8080"  // android emulator
  : "http://localhost:8080";  // ios simulator

const AccountCreation = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCreateAccount = async () => {
    // Validation
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters long!");
      return;
    }

    try {
      console.log(`Attempting account creation at: ${BACKEND_URL}/api/users/register`);
      
      // Call Spring Boot backend to create account
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok && data.success) {
        // Also insert into local database for offline access
        const usernameExists = await isUsernameAvailable(username);
        if (usernameExists) {
          await insertUser(username, password);
        }

        Alert.alert(
          "Account Created", 
          `Welcome, ${username}! You can now login.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form
                setUsername("");
                setPassword("");
                setConfirmPassword("");
                // Navigate to login
                router.push("/login");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Could not create account. Username may already exist.");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert(
        "Connection Error", 
        `Could not connect to server at ${BACKEND_URL}. Make sure:\n\n1. Spring Boot backend is running\n2. You're using the correct IP address\n3. You're testing on Android emulator or device (not web browser)`
      );
    }
  };

  return (
    <ImageBackground
      source={accountPic}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Button title="Create Account" onPress={handleCreateAccount} />

        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <Button
            title="Login"
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingLeft: 10,
    backgroundColor: "#fff",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default AccountCreation;