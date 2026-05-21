import React, { createContext, useContext, useMemo } from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import TaskDashboard from './taskDashboard';
import { setUpUserEvent } from '../../testUtils/setUpUserEvent';
import { getAllTasks, fetchTeamTasksCon } from '../../controller/tasksViewController';

// Mock Modules
vi.mock('../../controller/tasksViewController', () => ({
  getAllTasks: vi.fn(),
  fetchTeamTasksCon: vi.fn(),
}));

vi.mock('../../components/task/taskCard', () => ({
  default: function MockTaskCard({ task, onCardClick }: any) {
    return (
      <button onClick={() => onCardClick(task)} aria-label={`open-${task.id}`}>
        {`Task:${task.name} Developer:${task.userName} Est:${task.cost} Act:${task.spentHours ?? 0}`}
      </button>
    );
  },
}));

vi.mock('../../components/taskUpdate/taskUpdate', () => ({
  default: function MockTaskUpdate({ task, onSave, onClose }: any) {
    return (
      <div>
        <p>{`Editing:${task?.name}`}</p>
        <button
          onClick={() =>
            onSave({
              ...task,
              name: 'Done Ticket',
              userName: 'Alex QA',
              cost: 13,
              spentHours: 11,
              stateId: 1,
              getPriorityLabel: () => 'M',
              getStateLabel: () => 'Done',
            })
          }
        >
          Save As Done
        </button>
        <button onClick={onClose}>Close Edit</button>
      </div>
    );
  },
}));

vi.mock('../../components/taskForm/taskForm', () => ({
  default: function MockTaskForm({ isOpen, updateTaskList, onClose }: any) {
    return isOpen ? (
      <div>
        <button
          onClick={() =>
            updateTaskList({
              id: 700,
              assigneeId: 1,
              name: 'Realtime Added Task',
              userName: 'Realtime Dev',
              cost: 5,
              spentHours: 0,
              sprintEndDate: '2030-01-01',
              stateId: 2,
              getPriorityLabel: () => 'M',
              getStateLabel: () => 'Pending',
            })
          }
        >
          Add Mock Task
        </button>
        <button onClick={onClose}>Close Create</button>
      </div>
    ) : null;
  },
}));

function buildTask(overrides: Partial<any> = {}) {
  const task = {
    id: 1,
    name: 'Initial Task',
    userName: 'Diego',
    cost: 3,
    spentHours: 0,
    stateId: 2,
    sprintEndDate: '2030-01-01',
    getPriorityLabel: () => 'M',
    getStateLabel: () => {
    const states: Record<number, string> = { 1: 'Done', 2: 'Pending', 3: 'On Going', 4: 'Late' };
    return states[task.stateId] || 'Pending';
    },
    ...overrides,
  };

  

  return task;
}

describe('TaskDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.each([
    ['admin', fetchTeamTasksCon, getAllTasks],
    ['developer', getAllTasks, fetchTeamTasksCon],
  ])('loads role-aware dashboard data for %s users', async (role, expectedLoader, unexpectedLoader) => {
    const task = buildTask({ id: role === 'admin' ? 100 : 200, name: `${role}-task` });

    vi.mocked(fetchTeamTasksCon).mockResolvedValue([task]);
    vi.mocked(getAllTasks).mockResolvedValue([task]);

    setUpUserEvent(<TaskDashboard user={{ id: 9, role, teamId: 17, username: `${role}-user` }} />);

    await waitFor(() => {
      expect(expectedLoader).toHaveBeenCalled();
    });

    expect(unexpectedLoader).not.toHaveBeenCalled();
    
    const taskCard: HTMLElement = await screen.findByText(/Task:.*Developer:/i);
    expect(taskCard).toBeInTheDocument();
  });

  test('supports real-time task display and creation flow for assigned users', async () => {
    vi.mocked(getAllTasks).mockResolvedValue([buildTask({ id: 2, name: 'Assigned Existing' })]);

    const { user } = setUpUserEvent(
      <TaskDashboard user={{ id: 1, role: 'developer', teamId: 77, username: 'worker-1' }} />,
    );

    const existingTask: HTMLElement = await screen.findByText(/Assigned Existing/);
    expect(existingTask).toBeInTheDocument();

    const createBtn: HTMLElement = screen.getByRole('button', { name: /create task/i });
    await user.click(createBtn);

    const mockTaskBtn: HTMLElement = screen.getByRole('button', { name: /add mock task/i });
    await user.click(mockTaskBtn);

    const newTask: HTMLElement = await screen.findByText(/Realtime Added Task/);
    expect(newTask).toBeInTheDocument();
  });

  test('marks a task as completed and reflects task state and field changes', async () => {
    vi.mocked(getAllTasks).mockResolvedValue([
      buildTask({ id: 11, name: 'Implement API', stateId: 2, spentHours: 0 }),
    ]);

    const { user } = setUpUserEvent(
      <TaskDashboard user={{ id: 3, role: 'developer', teamId: 88, username: 'dev-3' }} />,
    );

    const openTaskBtn: HTMLElement = await screen.findByRole('button', { name: /open-11/i });
    await user.click(openTaskBtn);
    
    const editLabel: HTMLElement = screen.getByText(/Editing:Implement API/);
    expect(editLabel).toBeInTheDocument();

    const saveDoneBtn: HTMLElement = screen.getByRole('button', { name: /save as done/i });
    await user.click(saveDoneBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Editing:Implement API/)).not.toBeInTheDocument();
    });

    const completedTab: HTMLElement = screen.getByText('Completed');
    await user.click(completedTab);

    expect(await screen.findByText(/Done Ticket/)).toBeInTheDocument();
    expect(screen.getByText(/Developer:Alex QA/)).toBeInTheDocument();
    expect(screen.getByText(/Act:11/)).toBeInTheDocument();
  });

  test('works with context and a custom hook while user interacts with dashboard filters', async () => {
    // Testing with Contexts
    const UserContext = createContext<any>(null);

    // Testing Custom Hooks
    function useCompletedCount(tasks: Array<{ getStateLabel: () => string }>) {
      return useMemo(() => tasks.filter((task) => task.getStateLabel() === 'Done').length, [tasks]);
    }

    function ContextDrivenDashboard() {
      const user = useContext(UserContext);
      const completedCount = useCompletedCount([
        buildTask({ id: 98, stateId: 1 }),
        buildTask({ id: 99, stateId: 2 }),
      ]);

      return (
        <>
          <span>{`CompletedCount:${completedCount}`}</span>
          <TaskDashboard user={user} />
        </>
      );
    }

    vi.mocked(getAllTasks).mockResolvedValue([
      buildTask({ id: 54, name: 'Pending Ticket', stateId: 2 }),
      buildTask({ id: 55, name: 'Done Ticket Sprint', stateId: 1, spentHours: 4 }),
    ]);

    const { user } = setUpUserEvent(
      <UserContext.Provider value={{ id: 44, role: 'developer', teamId: 12, username: 'ctx-user' }}>
        <ContextDrivenDashboard />
      </UserContext.Provider>,
    );

    const countLabel: HTMLElement = await screen.findByText('CompletedCount:1');
    expect(countLabel).toBeInTheDocument();

    const pendingTab: HTMLElement = screen.getByText('Pending');
    await user.click(pendingTab);
    expect(screen.getByText(/Pending Ticket/)).toBeInTheDocument();

    const completedTab: HTMLElement = screen.getByText('Completed');
    await user.click(completedTab);
    expect(screen.getByText(/Done Ticket Sprint/)).toBeInTheDocument();
  });
});