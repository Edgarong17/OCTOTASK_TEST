import React, { useEffect, useState } from 'react';
import TaskCard from '../../components/task/taskCard';
import TaskUpdate from '../../components/taskUpdate/taskUpdate';
import { getAllTasks, fetchTeamTasksCon } from '../../controller/tasksViewController';
import { getAllSprintsController, getTeamMatesController } from '../../controller/filterController';
import './taskDashboard.css';
import TaskForm from '../../components/taskForm/taskForm';
import FilterHeader from '../../components/filterHeader/filterHeader';

const DEFAULT_FILTERS_BASE = {
  titleQuery: '',
  status: 'all',
  priority: 'all',
  sprintId: 'all',
  assigneeId: 'all',
  deliveryDate: '',
};

function getDefaultFilters(user) {
  const isPrivileged = user?.role === 'admin' || user?.role === 'manager';
  return {
    ...DEFAULT_FILTERS_BASE,
    assigneeId: isPrivileged ? 'all' : String(user?.id ?? 'all'),
  };
}

function TaskDashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [teamMates, setTeamMates] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState(getDefaultFilters(user));

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (updatedTask) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    handleCloseEditModal();
  };

  const handleDeleteTask = (deletedTaskId) => {
    const updatedTasks = tasks.filter(task => task.id !== deletedTaskId);
    setTasks(updatedTasks);
    handleCloseEditModal();
  }

  useEffect(() => {
    async function fetchTasks() {
      if (!user || !user.id) {
        return;
      }
      try {
        console.log('Fetching tasks for user:', user.username);
        if (user.role === 'admin') {
          const tasksGet = await fetchTeamTasksCon(user.teamId);
          setTasks(tasksGet);
        } else {
          const tasksGet = await getAllTasks(user.id);
          setTasks(tasksGet);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }
    fetchTasks();
  }, [user]);

  useEffect(() => {
    setFilterCriteria(getDefaultFilters(user));
  }, [user]);

  useEffect(() => {
    async function fetchSprints() {
      if (!user || !user.teamId) {
        return;
      }
      try {
        const sprintData = await getAllSprintsController(user.teamId);
        setSprints(sprintData || []);
      } catch (error) {
        console.error('Error fetching sprints for filter:', error);
      }
    }
    fetchSprints();
  }, [user]);

  useEffect(() => {
    async function fetchTeamMates() {
      if (!user || !user.teamId) {
        return;
      }
      try {
        const teamData = await getTeamMatesController(user.teamId);
        setTeamMates(teamData || []);
      } catch (error) {
        console.error('Error fetching team members for filter:', error);
      }
    }
    fetchTeamMates();
  }, [user]);

  function updateFilterField(field, value) {
    setFilterCriteria((prev) => ({ ...prev, [field]: value }));
  }

  function clearFilters() {
    setFilterCriteria(getDefaultFilters(user));
  }

  function getComparableDate(task) {
    const rawDate = task.sprintEndDate || task.updatedAt || task.createdAt;
    if (!rawDate) {
      return null;
    }
    const parsed = new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const titleWords = filterCriteria.titleQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filteredTasks = tasks.filter((task) => {
    const taskTitle = (task.name || '').toLowerCase();
    const matchesTitle =
      titleWords.length === 0 || titleWords.every((word) => taskTitle.includes(word));

    const matchesStatus =
      filterCriteria.status === 'all' || task.getStateLabel() === filterCriteria.status;

    const matchesPriority =
      filterCriteria.priority === 'all' || String(task.priorityId) === filterCriteria.priority;

    const matchesSprint =
      filterCriteria.sprintId === 'all' || String(task.sprintId) === filterCriteria.sprintId;

    const matchesAssignee =
      filterCriteria.assigneeId === 'all' || String(task.userId) === filterCriteria.assigneeId;

    let matchesDeliveryDate = true;
    if (filterCriteria.deliveryDate) {
      const dateValue = getComparableDate(task);
      if (!dateValue) {
        matchesDeliveryDate = false;
      } else {
        const selectedDate = new Date(`${filterCriteria.deliveryDate}T00:00:00`);
        matchesDeliveryDate =
          dateValue.getFullYear() === selectedDate.getFullYear() &&
          dateValue.getMonth() === selectedDate.getMonth() &&
          dateValue.getDate() === selectedDate.getDate();
      }
    }

    return (
      matchesTitle &&
      matchesStatus &&
      matchesPriority &&
      matchesSprint &&
      matchesAssignee &&
      matchesDeliveryDate
    );
  });

  const hasActiveFilters =
    filterCriteria.titleQuery !== '' ||
    filterCriteria.status !== 'all' ||
    filterCriteria.priority !== 'all' ||
    filterCriteria.sprintId !== 'all' ||
    filterCriteria.assigneeId !== getDefaultFilters(user).assigneeId ||
    filterCriteria.deliveryDate !== '';

  const sprintOptions =
    sprints.length > 0
      ? sprints
      : Array.from(
          new Map(
            tasks
              .filter((task) => task.sprintId != null)
              .map((task) => [
                String(task.sprintId),
                {
                  id: task.sprintId,
                  name: task.sprintNumber ? `Sprint ${task.sprintNumber}` : `Sprint ${task.sprintId}`,
                },
              ])
          ).values()
        );

  const isPrivileged = user?.role === 'admin' || user?.role === 'manager';

  const assigneeOptions = isPrivileged
    ? (teamMates.length > 0
        ? teamMates
        : Array.from(
            new Map(
              tasks
                .filter((task) => task.userId != null)
                .map((task) => [
                  String(task.userId),
                  { id: task.userId, name: task.userName || `User ${task.userId}` },
                ])
            ).values()
          ))
    : [{ id: user?.id, name: user?.username || 'My tasks' }];

  return (
    <main className="task-dashboard-container">
      <h1 className="task-title">Task Dashboard</h1>
      <div className="task-actions-row">
        <button className="create-task-button" onClick={() => setIsCreateModalOpen(true)}>+ Create Task</button>
        <FilterHeader
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen((prev) => !prev)}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
          filterCriteria={filterCriteria}
          onFilterChange={updateFilterField}
          sprintOptions={sprintOptions}
          assigneeOptions={assigneeOptions}
        />
      </div>

      <p className="task-filter-summary">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </p>

      <div className="task-dashboard">
        <div className="task-list task-late">
          <div className="task-list-header task-late-header">
            <p className='task-header-text'>LATE</p>
          </div>
          <div className="task-list-body">
            {filteredTasks.filter(task => task.getStateLabel() === 'Late').map((task) => (
              <TaskCard key={task.id} task={task} onCardClick={handleCardClick} />
            ))}
          </div>
        </div>
        <div className="task-list task-pending">
          <div className="task-list-header task-pending-header">
            <p className='task-header-text'>PENDING</p>
          </div>
          <div className="task-list-body">
            {filteredTasks.filter(task => task.getStateLabel() === 'Pending').map((task) => (
              <TaskCard key={task.id} task={task} onCardClick={handleCardClick} />
            ))}
          </div>
        </div>
        <div className="task-list task-progress">
          <div className="task-list-header task-progress-header">
            <p className='task-header-text'>IN PROGRESS</p>
          </div>
          <div className="task-list-body">
            {filteredTasks.filter(task => task.getStateLabel() === 'On Going').map((task) => (
              <TaskCard key={task.id} task={task} onCardClick={handleCardClick} />
            ))}
          </div>
        </div>
        <div className="task-list task-completed">
          <div className="task-list-header task-completed-header">
            <p className='task-header-text'>COMPLETED</p>
          </div>
          <div className="task-list-body">
            {filteredTasks.filter(task => task.getStateLabel() === 'Done').map((task) => (
              <TaskCard key={task.id} task={task} onCardClick={handleCardClick} />
            ))}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <TaskUpdate
          teamId={user.teamId}
          task={selectedTask}
          onClose={handleCloseEditModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskForm
        teamId={user.teamId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        updateTaskList={(newTask) => {
          if (user.role === 'admin') {
            setTasks(prevTasks => [...prevTasks, newTask]);
          }else{
            if (newTask.assigneeId === user.id) {
              setTasks(prevTasks => [...prevTasks, newTask]);
            }
          }
        }}
        taskTitle="Create New Task"
      />
    </main>
  );
}

export default TaskDashboard;