import * as FilterService from "../services/FilterService";

export async function getAllSprintsController(teamId) {
  try {
    return await FilterService.getAllSprints(teamId);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    throw error;
  }
}

export async function getTeamMatesController(teamId) {
  try {
    return await FilterService.getTeamMates(teamId);
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
}
