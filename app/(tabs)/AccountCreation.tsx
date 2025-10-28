// Important: Make sure you have renamed this file to AccountCreation.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import { insertUser, isUsernameAvailable } from "../../database/db";
import accountPic from "../../assets/images/accountCreationPic.jpg";

import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";

const AccountCreation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    const usernameExists = await isUsernameAvailable(username);
    if (!usernameExists) {
      Alert.alert("Error", "Username already exists!");
      return;
    }

    try {
      await insertUser(username, password);
      Alert.alert("Account Created", `Welcome, ${username}!`);

      navigation.navigate("login");

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "An error occurred while creating the account.");
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
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button title="Create Account" onPress={handleCreateAccount} />

        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <Button
            title="Login"
            onPress={() => {
              console.log("Navigation object:", navigation);
              if (navigation && navigation.navigate) {
                navigation.navigate("login");
              } else {
                console.error("Navigation is undefined!");
              }
            }}
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default AccountCreation;
