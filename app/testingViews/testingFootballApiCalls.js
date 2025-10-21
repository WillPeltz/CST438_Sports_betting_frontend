//Pretty similar to what was being done in testingApiCalls.js but for football with balldontlie api
import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { callGamesByDate } from "../ApiScripts"; // Assuming the function is in ApiScripts

const GameFetcher = () => {
  const startDate = "2025-01-01";
  const endDate = "2025-01-31";
  const teamID = "1"; 

  const testNFLFetchGames = async () => {
    try {
      console.log("Calling API...");
      const gameData = await callGamesByDateNFL(startDate, endDate, teamID);
      console.log("Fetched games:", gameData);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  useEffect(() => {
    testNFLFetchGames();
  }, []);

  return (
    <View>
      <Text>Check the console for fetched games!</Text>
      <Button title="Test API Call" onPress={testNFLFetchGames} />
    </View>
  );
};

export default GameFetcher;