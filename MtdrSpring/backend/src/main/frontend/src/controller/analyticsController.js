import {
  getNumTasksSprint,
  getNumTasksAll,
  getNumCompletedTasksSprint,
  getNumCompletedTasksAll,
  getNumPendingTasksSprint,
  getNumPendingTasksAll,
  getNumLateTasksSprint,
  getNumLateTasksAll,
  fetchMemberStatusBreak,
  fetchWorkHoursSprint,
  fetchAVGTasksPerMember,
  fetchAVGHoursPerMember,
  fetchCompletedTasksByMemberPerSprint,
  fetchWorkHoursByMemberPerSprint,
} from "../services/AnalyticsService";

export async function fetchNumTasksSprintController(teamId, sprintId) {
  try {
    const data = await getNumTasksSprint(teamId, sprintId);
    return data.num_tasks;
  } catch (error) {
    console.error("Error fetching task count for sprint:", error);
    throw error;
  }
}

export async function fetchNumTasksAllController(teamId) {
  try {
    const data = await getNumTasksAll(teamId);
    return data.num_tasks;
  } catch (error) {
    console.error("Error fetching task count for all sprints:", error);
    throw error;
  }
}

export async function fetchNumCompletedTasksSprintController(teamId, sprintId) {
  try {
    const data = await getNumCompletedTasksSprint(teamId, sprintId);
    return data.num_completed_tasks;
  } catch (error) {
    console.error("Error fetching completed task count for sprint:", error);
    throw error;
  }
}

export async function fetchNumCompletedTasksAllController(teamId) {
  try {
    const data = await getNumCompletedTasksAll(teamId);
    return data.num_completed_tasks;
  } catch (error) {
    console.error(
      "Error fetching completed task count for all sprints:",
      error,
    );
    throw error;
  }
}

export async function fetchNumPendingTasksSprintController(teamId, sprintId) {
  try {
    const data = await getNumPendingTasksSprint(teamId, sprintId);
    return data.num_pending_tasks;
  } catch (error) {
    console.error("Error fetching pending task count for sprint:", error);
    throw error;
  }
}

export async function fetchNumPendingTasksAllController(teamId) {
  try {
    const data = await getNumPendingTasksAll(teamId);
    return data.num_pending_tasks;
  } catch (error) {
    console.error("Error fetching pending task count for all sprints:", error);
    throw error;
  }
}

export async function fetchNumLateTasksSprintController(teamId, sprintId) {
  try {
    const data = await getNumLateTasksSprint(teamId, sprintId);
    return data.num_late_tasks;
  } catch (error) {
    console.error("Error fetching late task count for sprint:", error);
    throw error;
  }
}

export async function fetchNumLateTasksAllController(teamId) {
  try {
    const data = await getNumLateTasksAll(teamId);
    return data.num_late_tasks;
  } catch (error) {
    console.error("Error fetching late task count for all sprints:", error);
    throw error;
  }
}

export async function fetchMembersStatus(teamId, sprintId) {
  try {
    const data = await fetchMemberStatusBreak(teamId, sprintId);
    return data.member_status_breakdown;
  } catch (error) {
    console.error("Error fetching member status breakdown:", error);
    throw error;
  }
}

export async function fetchWorkHours(teamId, sprintId) {
  try {
    const data = await fetchWorkHoursSprint(teamId, sprintId);
    return data.work_hours;
  } catch (error) {
    console.error("Error fetching work hours for sprint:", error);
    throw error;
  }
}

export async function fetchAVGTasksPerMemberController(teamId) {
  try {
    const data = await fetchAVGTasksPerMember(teamId);
    return data.avg_tasks_per_member;
  } catch (error) {
    console.error("Error fetching average tasks per member:", error);
    throw error;
  }
}

export async function fetchAVGHours(teamId) {
  try {
    const data = await fetchAVGHoursPerMember(teamId);
    return data.avg_hours_per_member;
  } catch (error) {
    console.error("Error fetching average hours per member:", error);
    throw error;
  }
}

export async function fetchCompletedTasksByMemberPerSprintController(teamId) {
  try {
    const data = await fetchCompletedTasksByMemberPerSprint(teamId);
    return data.completed_tasks_by_member_per_sprint;
  } catch (error) {
    console.error(
      "Error fetching completed tasks by member per sprint:",
      error,
    );
    throw error;
  }
}

export async function fetchWorkHoursByMemberPerSprintController(teamId) {
  try {
    const data = await fetchWorkHoursByMemberPerSprint(teamId);
    return data.work_hours_by_member_per_sprint;
  } catch (error) {
    console.error("Error fetching work hours by member per sprint:", error);
    throw error;
  }
}

export function calculateKPIAVG(avgTasksPerMember, avgHoursPerMember) {
  return calculateKPIFromInputs({
    tasksPerMember: avgTasksPerMember,
    hoursPerMember: avgHoursPerMember,
    completedKey: "avg_completed_tasks",
    pendingKey: "avg_pending_tasks",
    lateKey: "avg_late_tasks",
    totalKey: "avg_total_tasks",
    hoursKey: "avg_hours_per_sprint",
  });
}

export function calculateKPI(tasksPerMember, hoursPerMember) {
  return calculateKPIFromInputs({
    tasksPerMember,
    hoursPerMember,
    completedKey: "completed_tasks",
    pendingKey: "pending_tasks",
    lateKey: "late_tasks",
    totalKey: null,
    hoursKey: "total_work_hours",
  });
}

function calculateKPIFromInputs({
  tasksPerMember,
  hoursPerMember,
  completedKey,
  pendingKey,
  lateKey,
  totalKey,
  hoursKey,
}) {
  const safeTasks = Array.isArray(tasksPerMember) ? tasksPerMember : [];
  const safeHours = Array.isArray(hoursPerMember) ? hoursPerMember : [];

  const hoursByMember = {};
  for (const row of safeHours) {
    const member = toNonEmptyString(row?.user_name);
    if (!member) continue;
    hoursByMember[member] = toNumber(row?.[hoursKey]);
  }

  const results = safeTasks
    .map((tasksRow) => {
      const member = toNonEmptyString(tasksRow?.user_name);
      if (!member) return null;

      const completed = toNumber(tasksRow?.[completedKey]);
      const pending = toNumber(tasksRow?.[pendingKey]);
      const late = toNumber(tasksRow?.[lateKey]);
      const total = totalKey
        ? toNumber(tasksRow?.[totalKey])
        : completed + pending + late;
      const hours = toNumber(hoursByMember[member]);

      const grade = computePerformanceScore({
        completedTasks: completed,
        pendingTasks: pending,
        lateTasks: late,
        totalTasks: total,
        timeWorkingHours: hours,
      });

      return { member, grade };
    })
    .filter(Boolean);

  results.sort((a, b) => (b.grade ?? 0) - (a.grade ?? 0));
  return results;
}

// Performance_Score = ((completed_tasks / total_tasks) * 50)
//                 + (((total_tasks - late_tasks) / total_tasks) * 20)
//                 + (((total_tasks - pending_tasks) / total_tasks) * 10)
//                 + ((completed_tasks / time_working_hours) * 20)
function computePerformanceScore({
  completedTasks,
  pendingTasks,
  lateTasks,
  totalTasks,
  timeWorkingHours,
}) {
  const completed = Math.max(0, toNumber(completedTasks));
  const pending = Math.max(0, toNumber(pendingTasks));
  const late = Math.max(0, toNumber(lateTasks));
  const total = Math.max(0, toNumber(totalTasks));
  const hours = Math.max(0, toNumber(timeWorkingHours));

  if (total === 0) return 0;

  const part1 = (completed / total) * 50;
  const part2 = ((total - late) / total) * 20;
  const part3 = ((total - pending) / total) * 10;
  const part4 = hours > 0 ? (completed / hours) * 20 : 0;

  return Math.round(clamp(part1 + part2 + part3 + part4, 0, 100));
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNonEmptyString(value) {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length > 0 ? s : "";
}
