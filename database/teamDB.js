import * as SQLite from 'expo-sqlite';
import { getUserID } from './userDB';

// 1. Don't open the database here. Just declare a variable.
let db = null;

/**
 * A function to get the database connection.
 * It will open the DB on its first call and re-use the connection after.
 */
const getDb = async () => {
  if (db) {
    return db; // Return the already-opened database
  }
  // If not open, open it, store it, and return it
  db = await SQLite.openDatabaseAsync('database.db');
  return db;
};

// --- Internal Helper Function ---
async function getTeamID(team_name) {
    try {
        const db = await getDb();
        const team = await db.getFirstAsync(
            `SELECT team_id FROM team WHERE team_name = ?;`,
            team_name
        );
        return team ? team.team_id : null;
    } catch (error) {
        console.error("Failed to get team ID:", error);
        return null;
    }
}

// --- Exported Functions ---

// Insert a team manually
async function insertTeamManually(team_id, team_name, nickname, logo_url) {
    try {
        const db = await getDb();
        await db.runAsync(
            `INSERT INTO team (team_id, team_name, nickname, logo_url) VALUES (?, ?, ?, ?);`,
            team_id,
            team_name,
            nickname,
            logo_url
        );
    } catch (error) {
        console.error("Failed to insert team manually:", error);
        throw error;
    }
}

// Insert a team using an array
async function insertTeam([team_id, team_name, nickname, logo_url]) {
    try {
        const db = await getDb();
        await db.runAsync(
            `INSERT INTO team (team_id, team_name, nickname, logo_url) VALUES (?, ?, ?, ?);`,
            team_id,
            team_name,
            nickname,
            logo_url
        );
    } catch (error) {
        console.error("Failed to insert team from array:", error);
        throw error;
    }
}

// Add a team to a user's favorites
async function addTeamToFavs(username, team_name) {
    try {
        const db = await getDb();
        const userID = await getUserID(username);
        const teamID = await getTeamID(team_name);

        if (userID && teamID) {
            await db.runAsync(
                `INSERT INTO favorite (team_id, user_id) VALUES (?, ?);`,
                teamID,
                userID
            );
        }
    } catch (error) {
        console.error("Failed to add team to favorites:", error);
        throw error;
    }
}

// Get all favorite team IDs of a user
async function getFavTeamID(username) {
    try {
        const db = await getDb();
        const userID = await getUserID(username);
        const teams = await db.getAllAsync(
            `SELECT team_id FROM favorite WHERE user_id = ?;`,
            userID
        );
        return teams.map(team => team.team_id);
    } catch (error) {
        console.error("Failed to get favorite team IDs:", error);
        return []; // Return empty array on error
    }
}

async function getFavTeamNames(username) {
    try {
        const db = await getDb();
        const userID = await getUserID(username);
        
        const teams = await db.getAllAsync(
            `SELECT t.team_name 
             FROM team t
             INNER JOIN favorite f ON t.team_id = f.team_id
             WHERE f.user_id = ?;`,
            userID
        );
        
        return teams.map(team => team.team_name);
    } catch (error) {
        console.error("Failed to get favorite team names:", error);
        return [];
    }
}

async function getAllFavTeamInfo(username) {
    try {
        const db = await getDb();
        const userID = await getUserID(username);
        
        const teams = await db.getAllAsync(
            `SELECT t.team_id, t.team_name, t.nickname, t.logo_url 
             FROM team t
             INNER JOIN favorite f ON t.team_id = f.team_id
             WHERE f.user_id = ?;`,
            userID
        );
        
        // Convert to array format matching original structure
        return teams.map(team => [team.team_id, team.team_name, team.nickname, team.logo_url]);
    } catch (error) {
        console.error("Failed to get all favorite team info:", error);
        return [];
    }
}

// Remove selected team from favorites 
async function removeTeamFromFav(username, team_name) {
    try {
        const db = await getDb();
        const user_id = await getUserID(username);
        const team_id = await getTeamID(team_name);

        if (user_id && team_id) {
            await db.runAsync(
                `DELETE FROM favorite WHERE user_id = ? AND team_id = ?;`,
                user_id,
                team_id
            );
        }
    } catch (error) {
        console.error("Failed to remove team from favorites:", error);
        throw error;
    }
}

export {
    insertTeamManually,
    insertTeam,
    addTeamToFavs,
    getFavTeamID,
    getFavTeamNames,
    getAllFavTeamInfo,
    getTeamID,
    removeTeamFromFav
};