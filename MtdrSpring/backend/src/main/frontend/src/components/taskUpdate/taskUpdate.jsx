import React, { useState, useEffect } from 'react';
import { FaUser } from "react-icons/fa";
import {
  getAllSprintsController,
  getTeamMatesController,
} from "../../controller/filterController";
import { getTimeUntilDue } from "../../controller/operationsController";
import {
  updateTaskController,
  deleteTaskController,
} from "../../controller/tasksViewController";
import "./taskUpdate.css";

const TaskUpdate = ({ teamId, task, onClose, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stateId, setStateId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [states, setStates] = useState([]);
  const [spentHours, setSpentHours] = useState('');


  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    if (task) {
      setName(task.name || '');
      setDescription(task.description || '');
      setStateId(task.stateId ?? '');
      setAssignedUserId(task.userId ?? '');
      setPriorityId(task.priorityId ?? '');
      setSprintId(task.sprintId ?? '');
      setEstimatedHours(task.cost ?? '');
      setSpentHours(task.spentHours ?? '');
    }


    getTeamMatesController(teamId)
      .then((data) => setTeamMembers(data))
      .catch((error) => {
        console.error("Error fetching team members:", error);
      });

    getAllSprintsController(teamId)
      .then((data) => setSprints(data))
      .catch((error) => {
        console.error("Error fetching sprints:", error);
      });
    
    

    const mockStates = [
        { id: 1, name: 'DONE' },
        { id: 2, name: 'PENDING' },
        { id: 3, name: 'ON GOING' },
        { id: 4, name: 'LATE' },
    ];
    setStates(mockStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const handleSave = async () => {
    const updatedTaskData = {
      name,
      description,
      userID: assignedUserId,
      userName:
        teamMembers.find((member) => Number(member.id) === Number(assignedUserId))?.name ||
        '',
      sprintID: sprintId,
      sprintNumber: sprints.find((s) => Number(s.id) === Number(sprintId))?.number || '',
      sprintEndDate: sprints.find((s) => Number(s.id) === Number(sprintId))?.endDate || '',
      stateID: stateId,
      priorityID : priorityId,
      linkToFile: task.linkToFile || '',
      createdAt: task.createdAt || '',
      updatedAt: new Date().toISOString(),
      cost: estimatedHours,
      spentHours: spentHours,
      visibility: task.visibility || 1
    };

    try {
      const updatedTask = await updateTaskController(task.id, updatedTaskData);
      if (typeof onSave === 'function') {
        onSave(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres borrar esta task?")) {
      try {
        await deleteTaskController(task.id);
        if (typeof onDelete === "function") {
          onDelete(task.id);
        }
        onClose();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const getPriorityClass = () => {
    switch (task.getPriorityLabel()) {
      case "H":
        return "priority-high-modal";
      case "M":
        return "priority-medium-modal";
      case "L":
        return "priority-low-modal";
      default:
        return "";
    }
  };

  if (!task) {
    return null;
  }

  return (
    <div className="tu-modal-overlay" onClick={onClose}>
      <div className="tu-modal-content" onClick={(e) => e.stopPropagation()}>

        <div className='tu-modal-header-container'>
          <div className='tu-modal-header'>Edit Task: </div>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='tu-modal-header-input'
          />
          <div className="tu-modal-actions">
            <button className="tu-btn-save" onClick={handleSave}>
              Save
            </button>
            <button className="tu-btn-close" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>

        <div className="modal-task-info">
          <div className="modal-task-info-task-column">
            <div className="modal-task-info-task-row-person">
              <div className="modal-task-info-task-row-person-tag">
                Assigned to:
              </div>
              <div className="modal-task-info-task-row-person-name">
                <FaUser className="modal-task-info-task-row-person-icon" />
                <select className="modal-task-info-task-row-person-name" value={assignedUserId} onChange={(e) => setAssignedUserId(Number(e.target.value))}>
                  <option value={assignedUserId} hidden>
                    {teamMembers.find((m) => Number(m.id) === Number(assignedUserId))?.name || 'Selected user'}
                  </option>
                  {teamMembers
                    .filter((member) => Number(member.id) !== Number(assignedUserId))
                    .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-task-info-task-row-priority">
              <div className="modal-task-info-task-row-priority-tag">
                Priority:
              </div>
              <div className="modal-task-info-task-row-priority-value">
                <div className={`card-info-pill-modal ${getPriorityClass()}`}>
                  {task.getPriorityLabel()}
                </div>
                <div className="modal-overdue-text">{getTimeUntilDue(task)}</div>
              </div>
            </div>
            <div className="modal-task-info-task-row-general">
              <div className="modal-task-info-task-row-general-tag">
                General:
              </div>
              <div className='modal-task-info-task-col-general'>
                <div className='modal-task-info-task-col-general-text'>Sprint Number: </div>
                <select className="modal-task-info-task-col-general-select" value={sprintId} onChange={(e) => setSprintId(Number(e.target.value))}>
                  <option value={sprintId} hidden>
                    {sprints.find((s) => Number(s.id) === Number(sprintId))?.name || 'Selected sprint'}
                  </option>
                  {sprints
                    .filter((sprint) => Number(sprint.id) !== Number(sprintId))
                    .map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='modal-task-info-task-col-general'>
                <div className='modal-task-info-task-col-general-text'>Estimated Hours: </div>
                <input 
                  type="text"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className='modal-task-info-task-col-general-input'
                />
              </div>
              <div className='modal-task-info-task-col-general'>
                <div className='modal-task-info-task-col-general-text'>Deliver Date: </div>
                <div className="modal-task-info-task-col-general-text-value">
                  {task.sprintEndDate ? new Date(task.sprintEndDate).toLocaleDateString() : "Sin fecha"}
                </div>
              </div>
              <div className='modal-task-info-task-col-general'>
                <div className='modal-task-info-task-col-general-text'>Created at: </div>
                <div className="modal-task-info-task-col-general-text-value">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Sin fecha"}
                </div>
              </div>
              <div className='modal-task-info-task-col-general'>
                <div className='modal-task-info-task-col-general-text'>Updated at: </div>
                <div className="modal-task-info-task-col-general-text-value">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "Sin fecha"}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-task-info-description-column">
            <div className="modal-task-info-task-row-state">
              <div className="modal-task-info-task-row-state-tag">State</div>
              <div className="state-select-wrapper">
                <select className="state-select" value={stateId} onChange={(e) => setStateId(Number(e.target.value))}>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {stateId === 1 && 
                <div className="modal-estimated-hours">
                  <div className="modal-estimated-hours-text">Spent Hours: </div>
                  <input 
                  type="text"
                  value={spentHours}
                  onChange={(e) => setSpentHours(e.target.value)}
                  className='modal-task-info-task-col-general-input-estimated-hours'
                />
                </div>}
              </div>
            </div>
            <div className="modal-task-info-task-row-description">
              <div className="modal-task-info-task-row-description-tag">
                Description:
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='modal-task-info-task-row-description-input'
              />
            </div>
          </div>
          <div className="modal-task-info-link-column">
            <div className="modal-task-info-link-column-tag">
              Links:
            </div>
            <div className="modal-task-info-link-column-content">
              {task.links && task.links.length > 0 ? (
                task.links.map((link, index) => (
                  <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="modal-task-info-link">
                    {link}
                  </a>
                ))
              ) : (
                <div className="modal-task-info-link-column-empty">No links available</div>
              )}
              <button className="tu-btn-close tu-btn-delete" onClick={handleDelete}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskUpdate;
