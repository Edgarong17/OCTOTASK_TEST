import React from "react";
import "./taskCard.css";
import { FaUser } from "react-icons/fa";
import {getTimeUntilDue} from "../../controller/operationsController";

const TaskCard = ({ task, onCardClick }) => {
  const getPriorityClass = () => {
    switch (task.getPriorityLabel()) {
      case "H":
        return "priority-high";
      case "M":
        return "priority-medium";
      case "L":
        return "priority-low";
      default:
        return "";
    }
  };

  return (
    <div className="card-container" onClick={() => onCardClick(task)}>
      <div className="card-header">
        <div className="card-title">{task.name}</div>
      </div>
      <div className="card-information">
        <div className="card-container-info">
          <div className="card-container-info-text">Difficulty</div>
          <div className={`card-info-pill ${getPriorityClass()}`}>
            {task.getPriorityLabel()}
          </div>
        </div>
        <div className="card-container-info">
          <div className="card-container-info-text">Cost</div>
          <div className="card-info-pill cost-pill">{task.cost}</div>
        </div>
        <div className="card-container-info">
          <div className="card-container-info-text">Delivery Date</div>
          <div className="card-info-pill date-pill">
            {task.sprintEndDate ? new Date(task.sprintEndDate).toLocaleDateString() : "Sin fecha"}
          </div>
        </div>
      </div>

      <div className="card-overdue">
        <div className="card-overdue-text">{getTimeUntilDue(task)}</div>
      </div>

      <div className="card-person">
        <FaUser />
        <div className="card-person-text">{task.userName}</div>
      </div>
    </div>
  );
};

export default TaskCard;