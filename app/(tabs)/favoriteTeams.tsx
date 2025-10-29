import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import {
  addTeamToFavs,
  removeTeamFromFav,
  getFavTeamNames,
  logDatabaseContents,
} from "../../database/db";

interface Team {
  id: number | string;
  name: string;
  nickname: string;
  logo: string;
}

const FavoriteTeams = () => {
  const route = useRoute<RouteProp<RootStackParamList, "favoriteTeams">>();
  const username = route.params?.username; // Get username from navigation params
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      if (!username) {
        console.error("No username received via navigation");
        return;
      }

      setLoading(true);

      try {
        const favTeams = await getFavTeamNames(username);
        setSelectedTeams(favTeams || []);
        // Fetch teams from new backend API.
        // Assumption: backend exposes an endpoint at /api/teams/getAllTeams that returns
        // either an array of team objects or an object with a `data` array.
        const host = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
        const url = `${host}/api/teams/getAllTeams`;
        console.log("Fetching teams from:", url);

        const resp = await fetch(url);
        if (!resp.ok) {
          console.error("Teams API returned non-OK status:", resp.status);
        }
        const raw = await resp.text();
        let json: any;
        try {
          json = JSON.parse(raw);
        } catch (err) {
          // If response was already JSON (resp.json would have worked), fallback
          try {
            json = await resp.json();
          } catch (err2) {
            console.error("Failed to parse teams response", err, err2);
            json = null;
          }
        }

        const teamArray = Array.isArray(json) ? json : json?.data || [];
        if (teamArray && teamArray.length > 0) {
          const mapped = teamArray.map((team: any) => ({
            id: team.id,
            name: team.name || team.full_name || team.teamName || "",
            nickname: team.nickname || team.abbreviation || "",
            logo:
              team.logo ||
              (team.abbreviation
                ? `https://interstate21.com/nba-logos/${team.abbreviation}.png`
                : undefined) ||
              "",
          }));
          setTeams(mapped);
        } else {
          console.error("No teams received from API.");
          setTeams([]);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }

      setLoading(false);
    };

    initialize();
  }, [username]);

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
        <Text style={styles.errorText}>No teams available. Check API Key.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => (item.id !== undefined && item.id !== null ? item.id.toString() : item.name)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teamItem,
                selectedTeams.includes(item.name) ? styles.selectedTeam : {},
              ]}
              onPress={() => toggleTeamSelection(item.name)}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: item.logo }} style={styles.logo} />
                <Text style={styles.teamText}>{item.name}</Text>
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