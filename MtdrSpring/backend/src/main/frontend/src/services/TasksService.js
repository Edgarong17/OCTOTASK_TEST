import API_LIST from "../API";

export function fetchTeamTasks(teamId) {
  return fetch(API_LIST + `/tasks/team/${teamId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Something went wrong ...");
    }
    return response.json();
  });
}

export function fetchUserTasks(userId) {
  return fetch(API_LIST + `/tasks/user/${userId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Something went wrong ...");
    }
    return response.json();
  });
}

export function createTask(taskData) {
  return fetch(API_LIST + "/tasks/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  }).then(async (response) => {
    if (response.ok) return response.json();

    let text = "";
    try {
      text = await response.text();
    } catch {
      // ignore
    }

    const details = text ? `: ${text}` : "";
    throw new Error(
      `Failed to create task (HTTP ${response.status})${details}`,
    );
  });
}

export function updateTask(taskId, taskData) {
  return fetch(API_LIST + `/tasks/update/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  }).then(async (response) => {
    if (response.ok) return response.json();

    let text = "";
    try {
      text = await response.text();
    } catch {
      // ignore
    }

    const details = text ? `: ${text}` : "";
    throw new Error(
      `Failed to update task (HTTP ${response.status})${details}`,
    );
  });
}

export function deleteTask(taskId) {
  return fetch(API_LIST + `/tasks/delete/${taskId}`, {
    method: "PUT",
  }).then(async (response) => {
    if (response.ok) return;
    let text = "";
    try {
      text = await response.text();
    } catch {
      // ignore
    }
    const details = text ? `: ${text}` : "";
    throw new Error(
      `Failed to delete task (HTTP ${response.status})${details}`,
    );
  });
}
