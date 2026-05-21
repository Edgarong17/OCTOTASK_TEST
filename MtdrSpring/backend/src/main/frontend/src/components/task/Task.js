export default class Task {
  constructor({
    id,
    userId,
    userName,
    name,
    description,
    sprintId,
    sprintNumber,
    sprintEndDate,
    stateId,
    priorityId,
    linkToFile,
    createdAt,
    updatedAt,
    cost,
    spentHours,
    visibility = 0,
  }) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.name = name;
    this.description = description;
    this.sprintId = sprintId;
    this.sprintNumber = sprintNumber;
    this.sprintEndDate = sprintEndDate;
    this.stateId = stateId;
    this.priorityId = priorityId;
    this.linkToFile = linkToFile;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.cost = cost;
    this.spentHours = spentHours;
    this.visibility = visibility;
  }

  getPriorityLabel() {
    const map = {
      1: "L",
      2: "M",
      3: "H",
    };
    return map[this.priorityId] || "Unknown";
  }

  getStateLabel() {
    const map = {
      1: "Done",
      2: "Pending",
      3: "On Going",
      4: "Late",
    };
    return map[this.stateId] || "Unknown";
  }
}
