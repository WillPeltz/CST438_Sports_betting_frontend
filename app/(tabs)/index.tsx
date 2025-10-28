import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Alert } from "react-native";
import { Image } from "expo-image";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import loginPicture from "../../assets/images/loginPic.jpg";
import { initializeDatabase } from "../../database/db"; 

const Index = () => {
  const router = useRouter(); 

  useEffect(() => {
    // Initialize the database and create tables when the component mounts
    const initializeDb = async () => {
      try {
        // call the function to initialize database and wait for it to finish
        await initializeDatabase();
      } catch (error) {
        console.error("Database initialization error: ", error);
        Alert.alert(
          "Error",
          "An error occurred while initializing the database."
        );
      }
    };

    initializeDb();
  }, []);

  // Function to navigate to the login screen
  const handleLogin = () => {
    router.push("/login"); 
  };

  // Function to navigate to the account creation screen
  const handleCreateAccount = () => {
    router.push("/AccountCreation"); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={loginPicture} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Login" onPress={handleLogin} />
        {/* 5. Removed the {" "} text node that was causing the crash */}
        <Button label="Create Account" onPress={handleCreateAccount} />
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: width * 0.95,
    height: height * 0.5,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
});

export default Index;