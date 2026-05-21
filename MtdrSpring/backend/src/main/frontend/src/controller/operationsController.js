export const getTimeUntilDue = (task) => {
  const now = new Date();
  // Asegura que la fecha sea un objeto Date, incluso si viene como string ISO
  const dueDate =
    typeof task.sprintEndDate === "string"
      ? new Date(task.sprintEndDate)
      : task.sprintEndDate;
  const diffInMs = dueDate - now;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 0) {
    const absMinutes = Math.abs(diffInMinutes);
    if (absMinutes < 60) {
      return `Late by ${absMinutes} minute${absMinutes !== 1 ? "s" : ""}`;
    } else if (absMinutes < 1440) {
      const hours = Math.floor(absMinutes / 60);
      return `Late by ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(absMinutes / 1440);
      return `Late by ${days} day${days !== 1 ? "s" : ""}`;
    }
  } else {
    if (diffInMinutes < 60) {
      return `Due in ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Due in ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Due in ${days} day${days !== 1 ? "s" : ""}`;
    }
  }
};
