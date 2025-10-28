import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
// 1. Import useLocalSearchParams from expo-router
import { useLocalSearchParams } from "expo-router";
// 2. Import your local database functions
import {
  addTeamToFavs,
  removeTeamFromFav,
  getFavTeamNames,
  logDatabaseContents,
  getAllTeams, // Import getAllTeams
} from "../../database/db"; // Make sure this path is correct

// 3. Update interface to match your local 'team' table schema
interface Team {
  team_id: number;
  team_name: string;
  nickname: string;
  logo_url: string;
}

const FavoriteTeams = () => {
  // 4. Use useLocalSearchParams to get parameters
  const { username } = useLocalSearchParams<{ username: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      if (!username) {
        console.error("No username received via navigation");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 5. Get favorite teams from the local DB
        const favTeams = await getFavTeamNames(username);
        setSelectedTeams(favTeams || []);

        // 6. Get ALL teams from your local database, not the API
        const teamData = await getAllTeams();

        if (teamData && teamData.length > 0) {
          setTeams(teamData);
        } else {
          console.error("No teams found in local database.");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
      setLoading(false);
    };

    initialize();
  }, [username]); // This hook will re-run if the username ever changes

  const toggleTeamSelection = async (team_name: string) => {
    if (!username) return;

    let updatedTeams = [...selectedTeams];

    if (updatedTeams.includes(team_name)) {
      await removeTeamFromFav(username, team_name);
      updatedTeams = updatedTeams.filter((name) => name !== team_name);
    } else {
      await addTeamToFavs(username, team_name);
      updatedTeams.push(team_name);
    }

    setSelectedTeams(updatedTeams);
    await logDatabaseContents();
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      {teams.length === 0 ? (
        <Text style={styles.errorText}>No teams available.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.team_id.toString()} // Use team_id
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teamItem,
                selectedTeams.includes(item.team_name) ? styles.selectedTeam : {},
              ]}
              onPress={() => toggleTeamSelection(item.team_name)}
            >
              <View style={styles.teamContainer}>
                {/* 7. Use logo_url and team_name from your DB */}
                <Image source={{ uri: item.logo_url }} style={styles.logo} />
                <Text style={styles.teamText}>{item.team_name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  teamItem: {
    padding: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 40, height: 40, marginRight: 10, resizeMode: "contain" },
  selectedTeam: { backgroundColor: "#87CEFA" },
  teamText: { fontSize: 18 },
});

export default FavoriteTeams;