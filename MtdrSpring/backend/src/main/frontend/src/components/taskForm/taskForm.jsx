import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createTaskController } from '../../controller/tasksViewController';
import {getAllSprintsController, getTeamMatesController} from "../../controller/filterController";
import { useEffect } from 'react';


import './taskForm.css';


function TaskForm({ teamId, isOpen, onClose, updateTaskList }) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('');
  const [attachment, setAttachment] = useState('');
  const [ estimatedHours, setEstimatedHours] = useState('');
  const [sprintId, setSprintId] = useState('');

  const [teamMembers, setTeamMembers] = useState([]);  
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    try {
      getTeamMatesController(teamId)
        .then((data) => setTeamMembers(data));
      getAllSprintsController(teamId)
        .then((data) => setSprints(data));
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }, [teamId]);

  const creationDate = new Date().toLocaleDateString('en-GB');

  if (!isOpen) return null;



  async function handleSubmit(e) {
    e.preventDefault();

    const newTaskData = {
      assigneeId,
      name: taskName,
      description,
      sprintId,
      priority,
      attachment,
      estimatedHours
    };
    
    console.log("Submitting new task to DB:", newTaskData);

    try {
      const newTask = await createTaskController(newTaskData);
      setTaskName('');
      setDescription('');
      setEstimatedHours('');
      setAssigneeId('');
      setSprintId('');
      onClose();

      if (typeof updateTaskList === 'function') {
        updateTaskList(newTask);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <span className="task-id">Create New Task</span>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          
          <div className="modal-main">
            <div className="form-group">
              <label className="modal-label">Task Name</label>
              <input 
                type="text" 
                className="modal-input" 
                placeholder="e.g. Patch OWASP injection vulnerabilities..." 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="modal-label">Description</label>
              <textarea 
                className="modal-input modal-textarea" 
                placeholder="Detailed description of the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="modal-label">Attachments / Links</label>
              <input 
                type="text" 
                className="modal-input" 
                placeholder="Paste Jira, Nextcloud, or GitHub links here..." 
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-sidebar">
            
            <div className="detail-row">
              <span className="detail-label">Created On</span>
              <span className="detail-value">{creationDate}</span>
            </div>
            
            <div className="form-group">
              <label className="modal-label">Assignee</label>
              <select 
                className="modal-input modal-select" 
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
              >
                <option value="" disabled hidden>Select user...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="modal-label">Sprint</label>
              <select 
                className="modal-input modal-select"
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                required
              >
                <option value="" disabled hidden>Select sprint...</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="modal-label">Priority</label>
              <select 
                className="modal-input modal-select" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="" disabled hidden>Set priority...</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>


              <div className="form-group">
                <label className="modal-label">Estimated Hours</label>
                <input 
                  type="number" 
                  className="modal-input" 
                  placeholder="e.g. 4" 
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
              </div>
            <div className="sidebar-footer">
              <button type="submit" className="modal-submit-btn">Create Task</button>
            </div>

          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}

export default TaskForm;