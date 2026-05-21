import API_LIST from "../API";

export function getAllSprints(teamId) {
  return fetch(`${API_LIST}/filter/sprints/${teamId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch sprints");
    }
    return response.json();
  });
}

export function getTeamMates(teamId) {
  return fetch(`${API_LIST}/filter/team-members/${teamId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch team members");
    }
    return response.json();
  });
}
