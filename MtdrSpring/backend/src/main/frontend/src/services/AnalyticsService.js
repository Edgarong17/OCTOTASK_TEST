import API_LIST from "../API";

export function getNumTasksSprint(teamId, sprintId) {
  return fetch(`${API_LIST}/analytics/numtasks/${teamId}/${sprintId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching task count");
      }
      return response.json();
    },
  );
}

export function getNumTasksAll(teamId) {
  return fetch(`${API_LIST}/analytics/numtasks/all/${teamId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching task count");
      }
      return response.json();
    },
  );
}

export function getNumCompletedTasksSprint(teamId, sprintId) {
  return fetch(
    `${API_LIST}/analytics/completedtasks/${teamId}/${sprintId}`,
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching completed task count");
    }
    return response.json();
  });
}

export function getNumCompletedTasksAll(teamId) {
  return fetch(`${API_LIST}/analytics/completedtasks/all/${teamId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching completed task count");
      }
      return response.json();
    },
  );
}

export function getNumPendingTasksSprint(teamId, sprintId) {
  return fetch(`${API_LIST}/analytics/pendingtasks/${teamId}/${sprintId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching pending task count");
      }
      return response.json();
    },
  );
}

export function getNumPendingTasksAll(teamId) {
  return fetch(`${API_LIST}/analytics/pendingtasks/all/${teamId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching pending task count");
      }
      return response.json();
    },
  );
}

export function getNumLateTasksSprint(teamId, sprintId) {
  return fetch(`${API_LIST}/analytics/latetasks/${teamId}/${sprintId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching late task count");
      }
      return response.json();
    },
  );
}

export function getNumLateTasksAll(teamId) {
  return fetch(`${API_LIST}/analytics/latetasks/all/${teamId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching late task count");
      }
      return response.json();
    },
  );
}

export function fetchMemberStatusBreak(teamId, sprintId) {
  return fetch(`${API_LIST}/analytics/memberstatus/${teamId}/${sprintId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching member status breakdown");
      }
      return response.json();
    },
  );
}

export function fetchWorkHoursSprint(teamId, sprintId) {
  return fetch(`${API_LIST}/analytics/workhours/${teamId}/${sprintId}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error("Error fetching work hours");
      }
      return response.json();
    },
  );
}

export function fetchAVGTasksPerMember(teamId) {
  return fetch(`${API_LIST}/analytics/avgtasks/${teamId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching average tasks per member");
    }
    return response.json();
  });
}

export function fetchAVGHoursPerMember(teamId) {
  return fetch(`${API_LIST}/analytics/avghours/${teamId}`).then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching average hours per member");
    }
    return response.json();
  });
}

export function fetchCompletedTasksByMemberPerSprint(teamId) {
  return fetch(
    `${API_LIST}/analytics/completedtasks/bymember/sprints/${teamId}`,
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching completed tasks by member per sprint");
    }
    return response.json();
  });
}

export function fetchWorkHoursByMemberPerSprint(teamId) {
  return fetch(
    `${API_LIST}/analytics/workhours/bymember/sprints/${teamId}`,
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching work hours by member per sprint");
    }
    return response.json();
  });
}
