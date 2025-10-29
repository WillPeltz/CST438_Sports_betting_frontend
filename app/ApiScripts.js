//for nba api, not currently in use
// export const apiCall = async (endpoint) => {
//   try {
//     const response = await fetch(endpoint, {
//       method: "GET",
//       headers: {
//         "x-rapidapi-key": "f48a5921f5msh580809ba8c9e6cfp181a8ajsn545d715d6844",
//         "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
//       },
//     });
//     const json = await response.json();
//     return json;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };
// export const callTeams = async () => {
//   try {
//     const json = await apiCall(
//       "https://api-nba-v1.p.rapidapi.com/teams?league=standard"
//     );
//     if (!json || !json.response) {
//       throw new Error("Invalid API response");
//     }
//     // Create the teamData array with below structure
//     const teamData = json.response
//       // I want to filter out teams that aren't nbaFranchises (you would think I could use the league filter, but it isn't an option)
//       // I want to check the nbaFranchise field and return a new array populated only with teams where this field is true
//       // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
//       .filter((team) => team.nbaFranchise === true)
//       // I also want to sort out specific information.
//       // This may change depending on what we need. For now, it will map out the fields we use in our table
//       .map((team) => ({
//         id: team.id,
//         name: team.name,
//         nickname: team.nickname,
//         logo: team.logo,
//       }));

//     //console.log("teamData:", teamData);
//     return teamData;
//   } catch (error) {
//     console.error("Error fetching nba teams:", error);
//     return [];
//   }
// };
import { Platform } from 'react-native';

export const callGamesByDate = async (startDate, endDate, teamID) => {
  try {
    console.log('Fetching games with params:', { startDate, endDate, teamID });
    // Use correct host depending on platform/emulator
    const host = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
    const url = `${host}/api/games/getAllGames`;
    console.log('Making request to:', url);

    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const rawResponse = await response.text();
    console.log('Raw response:', rawResponse);
    
    let json;
    try {
      json = JSON.parse(rawResponse);
      console.log('Parsed JSON:', json);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse API response');
    }
    
    if (!json) {
      throw new Error("Empty API response");
    }

    console.log('Starting to filter games');
    // Filter games based on the provided date range
    const gameData = json
      .filter((game) => {
        const gameDate = new Date(game.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log('Comparing dates:', {
          gameDate: gameDate.toISOString(),
          start: start.toISOString(),
          end: end.toISOString(),
          isInRange: gameDate >= start && gameDate <= end
        });
        return gameDate >= start && gameDate <= end;
      })
      .map((game) => {
        console.log('Mapping game:', game);
        return {
          id: game.id,
          date: new Date(game.date),
          homeTeam: {
            id: game.homeTeam.id,
            name: game.homeTeam.name,
            nickname: game.homeTeam.abbreviation,
            logo: `https://interstate21.com/nba-logos/${game.homeTeam.abbreviation}.png`,
          },
          awayTeam: {
            id: game.visitorTeam.id,
            name: game.visitorTeam.name,
            nickname: game.visitorTeam.abbreviation,
            logo: `https://interstate21.com/nba-logos/${game.visitorTeam.abbreviation}.png`,
          },
        };
      });
    console.log('Filtered and mapped games:', gameData);
    return gameData;
  } catch (error) {
    console.error("Error fetching games:", error);
    console.error("Error details:", error.message);
    return [];
  }
};
// for balldontlie api
export const apiCallBalldontlieNFL = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "balldontlie.api.key": "53fbbb6b-15ec-4db5-bdbc-7dfbeb809802",
        "balldontlie.api.url": "https://api.balldontlie.io/v1",
      },
    });
    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error(error);
    return null;
  }
};

export const callNFLTeams = async () => {
  try {
    const json = await apiCallBalldontlieNFL(
      "https://api.balldontlie.io/v1/teams"
    );
    if (!json || !json.data) {
      throw new Error("Invalid API response");
    }
    const footballTeamData = json.data.map((team) => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      conference: team.conference,
    }));
    return footballTeamData;
  } catch (error) {
    console.error("Error fetching football teams:", error);
    return [];
  }
};

export const callGamesByDateNFL = async (startDate, endDate, teamID) => {
  try {
    const json = await apiCallBalldontlieNFL(
      `http://localhost:8080/api/games/getAllGames`
      // `https://api.balldontlie.io/v1/games?team_ids[]=${teamID}&start_date=${startDate}&end_date=${endDate}`
    );

    if (!json || !json.data) {
      throw new Error("Invalid API response");
    }
    const footballGameData = json.data.map((game) => ({
      id: game.id,
      date: new Date(game.date),
      homeTeam: {
        id: game.home_team.id,
        name: game.home_team.full_name,
        abbreviation: game.home_team.abbreviation,
      },
      awayTeam: {
        id: game.visitor_team.id,
        name: game.visitor_team.full_name,
        abbreviation: game.visitor_team.abbreviation,
      },
    }));
    return footballGameData;
  } catch (error) {
    console.error("Error fetching football games:", error);
    return [];
  }
};
