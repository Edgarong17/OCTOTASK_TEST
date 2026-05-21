import { describe, test, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import AnalyticsView from "./AnalyticsView";
import { setUpUserEvent } from "../../testUtils/setUpUserEvent";
import { getAllSprintsController } from "../../controller/filterController";
import {
  fetchNumTasksSprintController,
  fetchNumTasksAllController,
  fetchNumCompletedTasksSprintController,
  fetchNumCompletedTasksAllController,
  fetchNumPendingTasksSprintController,
  fetchNumPendingTasksAllController,
  fetchNumLateTasksAllController,
  fetchNumLateTasksSprintController,
  fetchMembersStatus,
  fetchWorkHours,
  fetchAVGTasksPerMemberController,
  fetchAVGHours,
  fetchCompletedTasksByMemberPerSprintController,
  fetchWorkHoursByMemberPerSprintController,
  calculateKPI,
  calculateKPIAVG,
} from "../../controller/analyticsController";

// Mock Modules
vi.mock("../../controller/filterController", () => ({
  getAllSprintsController: vi.fn(),
}));

vi.mock("../../controller/analyticsController", () => ({
  fetchNumTasksSprintController: vi.fn(),
  fetchNumTasksAllController: vi.fn(),
  fetchNumCompletedTasksSprintController: vi.fn(),
  fetchNumCompletedTasksAllController: vi.fn(),
  fetchNumPendingTasksSprintController: vi.fn(),
  fetchNumPendingTasksAllController: vi.fn(),
  fetchNumLateTasksAllController: vi.fn(),
  fetchNumLateTasksSprintController: vi.fn(),
  fetchMembersStatus: vi.fn(),
  fetchWorkHours: vi.fn(),
  fetchAVGTasksPerMemberController: vi.fn(),
  fetchAVGHours: vi.fn(),
  fetchCompletedTasksByMemberPerSprintController: vi.fn(),
  fetchWorkHoursByMemberPerSprintController: vi.fn(),
  calculateKPI: vi.fn(),
  calculateKPIAVG: vi.fn(),
}));

vi.mock("recharts", () => {
  const MockComponent = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const MockBarChart = ({
    children,
    data,
  }: {
    children?: React.ReactNode;
    data?: unknown[];
  }) => (
    <div>
      <div>{`MockChartRows:${Array.isArray(data) ? data.length : 0}`}</div>
      {children}
    </div>
  );

  return {
    ResponsiveContainer: MockComponent,
    BarChart: MockBarChart,
    Bar: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
    LabelList: MockComponent,
    RadialBarChart: MockComponent,
    RadialBar: MockComponent,
    PolarAngleAxis: MockComponent,
  };
});

function arrangeSprintAndKpiMocks() {
  vi.mocked(getAllSprintsController).mockResolvedValue([
    { id: "s1", name: "Sprint 1" },
  ]);
  vi.mocked(fetchNumTasksSprintController).mockResolvedValue(10);
  vi.mocked(fetchNumCompletedTasksSprintController).mockResolvedValue(6);
  vi.mocked(fetchNumPendingTasksSprintController).mockResolvedValue(3);
  vi.mocked(fetchNumLateTasksSprintController).mockResolvedValue(1);

  // Dynamic Test Data
  vi.mocked(fetchMembersStatus).mockResolvedValue([
    { user_name: "Ana", completed_tasks: 4, pending_tasks: 1, late_tasks: 0 },
    { user_name: "Luis", completed_tasks: 2, pending_tasks: 2, late_tasks: 1 },
  ]);

  vi.mocked(fetchWorkHours).mockResolvedValue([
    { user_name: "Ana", total_work_hours: 14 },
    { user_name: "Luis", total_work_hours: 12 },
  ]);

  vi.mocked(calculateKPI).mockReturnValue([
    { member: "Ana", grade: 94 },
    { member: "Luis", grade: 72 },
  ]);

  vi.mocked(fetchNumTasksAllController).mockResolvedValue(40);
  vi.mocked(fetchNumCompletedTasksAllController).mockResolvedValue(28);
  vi.mocked(fetchNumPendingTasksAllController).mockResolvedValue(8);
  vi.mocked(fetchNumLateTasksAllController).mockResolvedValue(4);

  vi.mocked(fetchAVGTasksPerMemberController).mockResolvedValue([
    {
      user_name: "Ana",
      avg_total_tasks: 6,
      avg_completed_tasks: 5,
      avg_pending_tasks: 1,
      avg_late_tasks: 0,
    },
  ]);

  vi.mocked(fetchAVGHours).mockResolvedValue([
    { user_name: "Ana", avg_hours_per_sprint: 16 },
  ]);
  vi.mocked(calculateKPIAVG).mockReturnValue([{ member: "Ana", grade: 91 }]);

  vi.mocked(fetchCompletedTasksByMemberPerSprintController).mockResolvedValue([
    {
      sprint_id: 1,
      sprint_name: "Sprint 0",
      user_id: 1,
      user_name: "Ana",
      completed_tasks: 3,
    },
    {
      sprint_id: 1,
      sprint_name: "Sprint 0",
      user_id: 2,
      user_name: "Luis",
      completed_tasks: 2,
    },
    {
      sprint_id: 2,
      sprint_name: "Sprint 1",
      user_id: 1,
      user_name: "Ana",
      completed_tasks: 4,
    },
    {
      sprint_id: 2,
      sprint_name: "Sprint 1",
      user_id: 2,
      user_name: "Luis",
      completed_tasks: 1,
    },
  ]);

  vi.mocked(fetchWorkHoursByMemberPerSprintController).mockResolvedValue([
    {
      sprint_id: 1,
      sprint_name: "Sprint 0",
      user_id: 1,
      user_name: "Ana",
      total_work_hours: 10,
    },
    {
      sprint_id: 1,
      sprint_name: "Sprint 0",
      user_id: 2,
      user_name: "Luis",
      total_work_hours: 8,
    },
    {
      sprint_id: 2,
      sprint_name: "Sprint 1",
      user_id: 1,
      user_name: "Ana",
      total_work_hours: 12,
    },
    {
      sprint_id: 2,
      sprint_name: "Sprint 1",
      user_id: 2,
      user_name: "Luis",
      total_work_hours: 6,
    },
  ]);
}

describe("AnalyticsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    arrangeSprintAndKpiMocks();
  });

  test("renders default analytics headers and filter controls", async () => {
    setUpUserEvent(
      <AnalyticsView user={{ id: 1, teamId: 7, role: "admin" }} />,
    );

    expect(await screen.findByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Time Range:")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders team and per-person KPIs for a selected sprint", async () => {
    setUpUserEvent(
      <AnalyticsView user={{ id: 1, teamId: 7, role: "admin" }} />,
    );

    const title: HTMLElement = await screen.findByText("Analytics");
    expect(title).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchNumTasksSprintController).toHaveBeenCalledWith(7, "s1");
      expect(fetchMembersStatus).toHaveBeenCalledWith(7, "s1");
      expect(fetchWorkHours).toHaveBeenCalledWith(7, "s1");
    });

    expect(screen.getByText("Missing & On Going Tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
    expect(screen.getByText("Late Tasks")).toBeInTheDocument();
  });

  test("switches to all-sprints mode and loads aggregate weekly/sprint KPIs", async () => {
    const { user } = setUpUserEvent(
      <AnalyticsView user={{ id: 3, teamId: 22, role: "admin" }} />,
    );

    const selectBox: HTMLElement = await screen.findByRole("combobox");
    await screen.findByRole("option", { name: /all sprints/i });

    await user.selectOptions(selectBox, "allsprints");

    await waitFor(() => {
      expect(fetchNumTasksAllController).toHaveBeenCalledWith(22);
      expect(
        fetchCompletedTasksByMemberPerSprintController,
      ).toHaveBeenCalledWith(22);
      expect(fetchWorkHoursByMemberPerSprintController).toHaveBeenCalledWith(
        22,
      );
      expect(calculateKPIAVG).toHaveBeenCalled();
    });

    expect(
      screen.getByText("Tasks Completed by Developer per Sprint"),
    ).toBeInTheDocument();
  });
});
