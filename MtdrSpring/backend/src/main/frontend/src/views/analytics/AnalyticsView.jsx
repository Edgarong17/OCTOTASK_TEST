import { useEffect, useMemo, useState } from 'react';
import { MdCalendarMonth, MdInsertDriveFile } from 'react-icons/md';
import './AnalyticsView.css';

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LabelList } from 'recharts';

import { getAllSprintsController } from '../../controller/filterController';
import { fetchNumTasksSprintController, fetchNumTasksAllController 
  , fetchNumCompletedTasksSprintController, fetchNumCompletedTasksAllController,
  fetchNumPendingTasksSprintController, fetchNumPendingTasksAllController,
  fetchNumLateTasksAllController, fetchNumLateTasksSprintController,
  fetchMembersStatus, fetchWorkHours, fetchAVGTasksPerMemberController,
  fetchAVGHours, fetchCompletedTasksByMemberPerSprintController, calculateKPI, calculateKPIAVG,
  fetchWorkHoursByMemberPerSprintController
} from '../../controller/analyticsController';


function AnalyticsView({ user }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);


  const [numLateTasks, setNumLateTasks] = useState(0);
  const [numPendingTasks, setNumPendingTasks] = useState(0);
  const [numCompletedTasks, setNumCompletedTasks] = useState(0);
  const [numTotalTasks, setNumTotalTasks] = useState(0);

  const [membersStatus, setMembersStatus] = useState([]);
  const [workHours, setWorkHours ] = useState([]);
  const [ setAvgTasksPerMember ] = useState([]);
  const [ setAvgHoursPerMember ] = useState([]);

  const [completedByMemberPerSprint, setCompletedByMemberPerSprint] = useState([]);
  const [workHoursByMemberPerSprint, setWorkHoursByMemberPerSprint] = useState([]);

  const [kpiGrades, setKpiGrades] = useState([]);
  const [recentActivity] = useState([]);

  const completedPerSprintChart = useMemo(() => {
    const rows = Array.isArray(completedByMemberPerSprint) ? completedByMemberPerSprint : [];
    const membersSet = new Set();
    const sprintOrder = [];
    const bySprint = new Map();

    for (const row of rows) {
      const rawSprintName = row?.sprint_name;
      const sprintName = rawSprintName != null ? String(rawSprintName).trim() : '';
      const sprintId = row?.sprint_id;
      let sprintLabel = sprintName;
      if (!sprintLabel && sprintId != null) sprintLabel = String(sprintId);
      if (sprintLabel && !/^sprint\s+/i.test(sprintLabel)) sprintLabel = `Sprint ${sprintLabel}`;
      if (!sprintLabel) sprintLabel = 'Sprint';

      const memberName = typeof row?.user_name === 'string' ? row.user_name.trim() : '';
      if (!memberName) continue;

      membersSet.add(memberName);

      if (!bySprint.has(sprintLabel)) {
        bySprint.set(sprintLabel, { sprint: sprintLabel });
        sprintOrder.push(sprintLabel);
      }

      const sprintRow = bySprint.get(sprintLabel);
      sprintRow[memberName] = Number(row?.completed_tasks) || 0;
    }

    return {
      data: sprintOrder.map((key) => bySprint.get(key)),
      members: Array.from(membersSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [completedByMemberPerSprint]);

  const workHoursPerSprintChart = useMemo(() => {
    const rows = Array.isArray(workHoursByMemberPerSprint) ? workHoursByMemberPerSprint : [];
    const membersSet = new Set();
    const sprintOrder = [];
    const bySprint = new Map();

    for (const row of rows) {
      const rawSprintName = row?.sprint_name;
      const sprintName = rawSprintName != null ? String(rawSprintName).trim() : '';
      const sprintId = row?.sprint_id;
      let sprintLabel = sprintName;
      if (!sprintLabel && sprintId != null) sprintLabel = String(sprintId);
      if (sprintLabel && !/^sprint\s+/i.test(sprintLabel)) sprintLabel = `Sprint ${sprintLabel}`;
      if (!sprintLabel) sprintLabel = 'Sprint';

      const memberName = typeof row?.user_name === 'string' ? row.user_name.trim() : '';
      if (!memberName) continue;

      membersSet.add(memberName);

      if (!bySprint.has(sprintLabel)) {
        bySprint.set(sprintLabel, { sprint: sprintLabel });
        sprintOrder.push(sprintLabel);
      }

      const sprintRow = bySprint.get(sprintLabel);
      sprintRow[memberName] = Number(row?.total_work_hours) || 0;
    }

    return {
      data: sprintOrder.map((key) => bySprint.get(key)),
      members: Array.from(membersSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [workHoursByMemberPerSprint]);

  useEffect(() => {
    async function fetchSprints() {
      try {
        const sprintsData = await getAllSprintsController(user.teamId);
        const sprintsWithAll = [...sprintsData, { id: 'allsprints', name: 'All Sprints' }];
        setSprints(sprintsWithAll);

        const initialSprintId = sprintsData.length > 0 ? sprintsData[0].id : 'allsprints';
        setSelectedSprint(initialSprintId);
        fetchDataForSprint(initialSprintId);
      } catch (error) {
        console.error('Error fetching sprints:', error);
      }
    }
    fetchSprints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.teamId]);


  async function fetchDataForSprint(sprintId) {
    try {
      if (sprintId === 'allsprints') {
        const totalTasks = await fetchNumTasksAllController(user.teamId);
        const completedTasks = await fetchNumCompletedTasksAllController(user.teamId);
        const pendingTasks = await fetchNumPendingTasksAllController(user.teamId);
        const lateTasks = await fetchNumLateTasksAllController(user.teamId);
        const avgTasksPerMember = await fetchAVGTasksPerMemberController(user.teamId);
        const avgHoursPerMember = await fetchAVGHours(user.teamId);

        const completedByMemberPerSprint = await fetchCompletedTasksByMemberPerSprintController(user.teamId);
        const workHoursByMemberPerSprint = await fetchWorkHoursByMemberPerSprintController(user.teamId);

         const kpiGrades = calculateKPIAVG(avgTasksPerMember, avgHoursPerMember);


        setNumTotalTasks(totalTasks);
        setNumCompletedTasks(completedTasks);
        setNumPendingTasks(pendingTasks);
        setNumLateTasks(lateTasks);

        setMembersStatus([]);
        setWorkHours([]);
        setAvgTasksPerMember(avgTasksPerMember);
        setAvgHoursPerMember(avgHoursPerMember);
        setKpiGrades(kpiGrades);
        setCompletedByMemberPerSprint(completedByMemberPerSprint);
        setWorkHoursByMemberPerSprint(workHoursByMemberPerSprint);
      } else {
        const totalTasks = await fetchNumTasksSprintController(user.teamId, sprintId);
        const completedTasks = await fetchNumCompletedTasksSprintController(user.teamId, sprintId);
        const pendingTasks = await fetchNumPendingTasksSprintController(user.teamId, sprintId);
        const lateTasks = await fetchNumLateTasksSprintController(user.teamId, sprintId);
        const membersStatus = await fetchMembersStatus(user.teamId, sprintId);
        const workHours = await fetchWorkHours(user.teamId, sprintId);

        const kpiGrades = calculateKPI(membersStatus, workHours);

        setNumTotalTasks(totalTasks);
        setNumCompletedTasks(completedTasks);
        setNumPendingTasks(pendingTasks);
        setNumLateTasks(lateTasks);


        
        setAvgTasksPerMember([]);
        setAvgHoursPerMember([]);
        setMembersStatus(membersStatus);
        setWorkHours(workHours);
        setKpiGrades(kpiGrades);
        setCompletedByMemberPerSprint([]);
        setWorkHoursByMemberPerSprint([]);
      }
    } catch (error) {
      console.error('Error fetching data for sprint:', error);
    }
  }

  async function handleSprintChange(e) {
    const sprintId = e.target.value;
    setSelectedSprint(sprintId);
    await fetchDataForSprint(sprintId);
  }

  
  


  return (
    <main className="analytics-container">
      
      <div className="analytics-dashboard">
        <div className="analytics-title-row">
          <h1 className="analytics-title">Analytics</h1>
          <div className="analytics-filter-container">
            <p className="analytics-filter-label">Time Range:</p>
            <select className="analytics-filter" value={selectedSprint} onChange={handleSprintChange}>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="analytics-mainKPI-row">
            <div className="analytics-kpi-card kpi-horizontal">
              <div className="analytics-kpi-icon-circle">
                <MdInsertDriveFile size={48} color="#FFFFFF" />
              </div>
              <div className="analytics-kpi-content">
                <span className='analytics-kpi-label'>Missing & On Going Tasks</span>
                <span className="analytics-kpi-value">{numPendingTasks}</span>
              </div>
            </div>
            <div className="analytics-kpi-card kpi-horizontal">
              <div className="analytics-kpi-progress-circle">
                {numTotalTasks > 0 && (
                  <RadialBarChart width={96} height={96} cx={48} cy={48} innerRadius={36} outerRadius={44} barSize={14}
                    data={[{ name: 'Completed', value: numTotalTasks > 0 ? Math.round((numCompletedTasks / numTotalTasks) * 100) : 0, fill: '#fff' }]}
                    style={{ background: 'transparent', maxWidth: '100%', height: 'auto' }}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar 
                      minAngle={0}
                      background={{ fill: '#5c5766' }}
                      clockWise={true}
                      dataKey="value"
                      cornerRadius={44}
                      fill="#fff"
                    />
                  </RadialBarChart>
                )}
                <div className="analytics-kpi-progress-text">{numTotalTasks > 0 ? Math.round((numCompletedTasks/numTotalTasks)*100) : 0}%</div>
              </div>
              <div className="analytics-kpi-content">
                <span className='analytics-kpi-label'>Completed Tasks</span>
                <span className="analytics-kpi-value">{numCompletedTasks}</span>
              </div>
            </div>
            <div className="analytics-kpi-card kpi-horizontal">
              <div className="analytics-kpi-icon-circle">
                <MdCalendarMonth size={48} color="#FFFFFF" />
              </div>
              <div className="analytics-kpi-content">
                <span className='analytics-kpi-label'>Late Tasks</span>
                <span className="analytics-kpi-value">{numLateTasks}</span>
              </div>
            </div>
        </div>
        <div className={`analytics-charts-row${selectedSprint === 'allsprints' ? ' analytics-charts-row-allsprints' : ''}`}>
          <div className="analytics-chart-grades">
            {selectedSprint !== 'allsprints' ? (
              <>
                <h2 className="analytics-chart-title">Tasks per User</h2>
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                  <BarChart
                    data={membersStatus.map((user) => ({
                      member: user.user_name,
                      completedTasks: user.completed_tasks,
                      pendingTasks: user.pending_tasks,
                      lateTasks: user.late_tasks,
                    }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap={10}
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="member" stroke="#fff" tick={{ fontSize: 14 }} />
                    <YAxis stroke="#fff" allowDecimals={false} tick={{ fontSize: 14 }} />
                    <Tooltip
                      cursor={{ fill: '#444', opacity: 0.2 }}
                      contentStyle={{ background: '#222', border: 'none', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar
                      dataKey="completedTasks"
                      fill="#7ed957"
                      name="Completed"
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="completedTasks" position="top" fill="#fff" fontSize={14} />
                    </Bar>
                    <Bar
                      dataKey="pendingTasks"
                      fill="#ff9800"
                      name="Pending"
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="pendingTasks" position="top" fill="#fff" fontSize={14} />
                    </Bar>
                    <Bar
                      dataKey="lateTasks"
                      fill="#c56261"
                      name="Late"
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="lateTasks" position="top" fill="#fff" fontSize={14} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <h2 className="analytics-chart-title">Tasks Completed by Developer per Sprint</h2>
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                  <BarChart
                    data={completedPerSprintChart.data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap={10}
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="sprint"
                      stroke="#fff"
                      tick={{ fontSize: 14 }}
                      label={{ value: 'Sprint Number', position: 'insideBottom', offset: -2, fill: '#fff' }}
                    />
                    <YAxis
                      stroke="#fff"
                      allowDecimals={false}
                      tick={{ fontSize: 14 }}
                      label={{
                        value: 'Número de tareas completadas',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#fff',
                        style: { textAnchor: 'middle', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 },
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: '#444', opacity: 0.2 }}
                      contentStyle={{ background: '#222', border: 'none', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    {(() => {
                      const palette = ['#7ed957', '#ff9800', '#c56261', '#8884d8', '#795be6'];
                      return completedPerSprintChart.members.map((member, idx) => (
                        <Bar
                          key={member}
                          dataKey={member}
                          fill={palette[idx % palette.length]}
                          name={member}
                          radius={[8, 8, 0, 0]}
                        >
                          <LabelList dataKey={member} position="top" fill="#fff" fontSize={14} />
                        </Bar>
                      ));
                    })()}
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
          <div className="analytics-chart-tasks">
             {selectedSprint !== 'allsprints' ? (
              <>
                <h2 className="analytics-chart-title">Hours per Member</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={workHours.map((user) => ({
                      member: user.user_name,
                      totalTime: user.total_work_hours,
                    }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="member" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      cursor={{ fill: '#444', opacity: 0.2 }} 
                      contentStyle={{ background: '#222', border: 'none', color: '#fff' }} 
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="totalTime" fill="#8884d8" name="Total Hours" maxBarSize={40} radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="totalTime" position="top" fill="#fff" fontSize={14} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <h2 className="analytics-chart-title">Hours by Developer per Sprint</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={workHoursPerSprintChart.data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    barCategoryGap={10}
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="sprint"
                      stroke="#fff"
                      label={{ value: 'Sprint Number', position: 'insideBottom', offset: -2, fill: '#fff' }}
                    />
                    <YAxis
                      stroke="#fff"
                      allowDecimals={false}
                      label={{
                        value: 'Número de horas trabajadas',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#fff',
                        style: { textAnchor: 'middle', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 },
                      }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#444', opacity: 0.2 }} 
                      contentStyle={{ background: '#222', border: 'none', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    {(() => {
                      const palette = ['#7ed957', '#ff9800', '#c56261', '#8884d8', '#795be6'];
                      return workHoursPerSprintChart.members.map((member, idx) => (
                        <Bar
                          key={member}
                          dataKey={member}
                          fill={palette[idx % palette.length]}
                          name={member}
                          radius={[8, 8, 0, 0]}
                        >
                          <LabelList dataKey={member} position="top" fill="#fff" fontSize={14} />
                        </Bar>
                      ));
                    })()}
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
        <div className="analytics-activity-row">
          <div className="analytics-recent-activity">
            <div className="analytics-chart-grades">
            <h2 className="analytics-chart-title">KPI's per Member</h2>
            <ResponsiveContainer width="100%" height="100%" minHeight={120}>
              <BarChart
                data={kpiGrades}
                margin={{ top: 0, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="member" stroke="#fff" tick={{ fontSize: 14 }} />
                <YAxis stroke="#fff" domain={[0, 100]} tick={{ fontSize: 14 }} />
                <Tooltip cursor={{ fill: '#444', opacity: 0.2 }} contentStyle={{ background: '#222', border:
                   'none', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="grade" fill="#795be6" maxBarSize={48} name="Grade" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
          <div className="analytics-recent-activity">
            <h2 className="analytics-chart-title">Recent Activity</h2>
            <div className="analytics-activity-list">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="analytics-activity-item">
                  <span className="analytics-activity-member">{activity.member}</span>
                  <span className="analytics-activity-action">{activity.action}</span>
                  <span className="analytics-activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AnalyticsView;