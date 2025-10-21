import * as SQLite from 'expo-sqlite';

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

// Insert a new user into the database
async function insertUser(username, password) {
    try {
        const db = await getDb(); // Get the DB connection
        await db.runAsync(
            `INSERT INTO user (username, password) VALUES (?, ?);`,
            username,
            password
        );
    } catch (error) {
        console.error("Failed to insert user:", error);
        throw error;
    }
}

// Verify login info
async function verifyUserLogin(username, password) {
    const db = await getDb(); // Get the DB connection
    try {
        // First, check if the user exists with the provided username
        const user = await db.getFirstAsync(
            'SELECT password FROM user WHERE username = ?', 
            username  // Changed from named parameter to positional
        );
        
        // Log the user details to check the result
        console.log('User from verifyUserLogin:', user);
        
        if (user) {
            // Check if the password matches
            if (user.password === password) {
                console.log('Login successful');
                return true;
            } else {
                console.log('Invalid password');
                return false;
            }
        } else {
            console.log('User not found');
            return false;
        }
    } catch (error) {
        console.error("Login verification failed:", error);
        return false;  // Return false in case of error
    }
}
  
// For account recovery
async function updatePassword(username, oldPassword, newPassword) {
    try {
        const db = await getDb(); 
        const result = await db.runAsync(
            `UPDATE user SET password = ? WHERE username = ? AND password = ?;`,
            newPassword,
            username,
            oldPassword
        );
        // Check if any rows were actually updated
        return result.changes > 0;
    } catch (error) {
        console.error("Failed to update password:", error);
        throw error;
    }
}

// For ensuring usernames are unique
async function isUsernameAvailable(username) {
    try {
        const db = await getDb(); 
        const user = await db.getFirstAsync(
            `SELECT username FROM user WHERE username = ?;`,
            username
        );
        return !user;
    } catch (error) {
        console.error("Failed to check username availability:", error);
        throw error;
    }
}

// Remove a user from the database
async function removeUser(username) {
    try {
        const db = await getDb(); 
        await db.runAsync(`DELETE FROM user WHERE username = ?;`, username);
    } catch (error) {
        console.error("Failed to remove user:", error);
        throw error;
    }
}

// Get user ID based on username
async function getUserID(username) {
    try {
        const db = await getDb(); // Get the DB connection
        const user = await db.getFirstAsync(
            `SELECT id FROM user WHERE username = ?;`,
            username 
        );
        return user ? user.id : null;
    } catch (error) {
        console.error("Failed to get user ID:", error);
        return null;
    }
}

export {
    insertUser,
    verifyUserLogin,
    updatePassword,
    isUsernameAvailable,
    removeUser,
    getUserID
};
