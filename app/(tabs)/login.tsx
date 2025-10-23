import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../utils/navigation/types";
import loginPic from "../../assets/images/loginPic2.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT: Replace 'YOUR_LOCAL_IP' with your computer's local IP address
      const response = await fetch("http://10.0.2.2:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      setLoading(false);

      if (response.ok) {
        // Successful login
        const user = await response.json();

        // Store user info in AsyncStorage for session management
        await AsyncStorage.setItem("username", user.username);
        // You can also store a user ID or token if your backend sends one
        // await AsyncStorage.setItem("userID", user.id.toString());

        Alert.alert("Welcome", `You are now logged in as ${user.username}!`);

        // Navigate to the main part of the app
        navigation.navigate("favoriteTeams", { username: user.username });
      } else {
        // Failed login
        const errorMessage = await response.text();
        Alert.alert("Login Failed", errorMessage || "Invalid username or password.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      Alert.alert("Connection Error", "Could not connect to the server.");
    }
  };

  return (
    <ImageBackground source={loginPic} style={styles.backgroundImage}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button title="Login" onPress={handleLogin} />
            <Button
              title="Create Account"
              onPress={() => navigation.navigate("AccountCreation")}
              color="#aaa" // Optional: differentiate the button
            />
          </>
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
    backgroundColor: "rgba(0,0,0,0.3)", // Added a slight overlay for readability
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
});