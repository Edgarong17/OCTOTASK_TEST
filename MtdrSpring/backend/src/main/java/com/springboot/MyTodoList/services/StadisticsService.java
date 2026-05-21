package com.springboot.MyTodoList.services;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import com.springboot.MyTodoList.mappers.TaskRowMapper;
import com.springboot.MyTodoList.model.Task;

@Service
public class StadisticsService {

    private final JdbcTemplate jdbcTemplate;

    public StadisticsService(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    // Number of tasks by sprint and team
    public Integer getNumTasksBySprintId(int teamId, int sprintId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN APP_USER u ON u.id = t.user_id JOIN SPRINT s ON s.id = t.sprint_id WHERE u.team_id = ? AND t.sprint_id = ? AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId, sprintId);
    }

    public Integer getNumTasksByTeamId(int teamId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN APP_USER u ON u.id = t.user_id WHERE u.team_id = ? AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId);
    }

    // Number of completed tasks by sprint and team
    public Integer getNumCompletedTasksBySprintId(int teamId, int sprintId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN SPRINT s ON s.id = t.sprint_id WHERE s.team_id = ? and t.sprint_id = ? AND ts.name = 'DONE' AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId, sprintId);
    }

    public Integer getNumCompletedTasksByTeamId(int teamId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN SPRINT s ON s.id = t.sprint_id WHERE ts.name = 'DONE' AND s.team_id = ? AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId);
    }

    // Number of pending tasks by sprint and team
    public Integer getNumPendingTasksBySprintId(int teamId, int sprintId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN SPRINT s ON s.id = t.sprint_id WHERE s.team_id = ? and t.sprint_id = ? AND ts.name != 'DONE' AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId, sprintId);
    }

    public Integer getNumPendingTasksByTeamId(int teamId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN SPRINT s ON s.id = t.sprint_id WHERE ts.name != 'DONE' AND s.team_id = ? AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId);
    }

    // Number of late tasks by sprint and team
    public Integer getLateTasksBySprintId(int teamId, int sprintId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN SPRINT s ON s.id = t.sprint_id WHERE s.team_id = ? AND t.sprint_id = ? AND ts.name = 'LATE' AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId, sprintId);
    }

    public Integer getLateTasksByTeamId(int teamId) {
        String sql = "SELECT COUNT(*) FROM TASKS t JOIN TASK_STATE ts ON ts.id = t.state_id JOIN APP_USER u ON u.id = t.user_id WHERE u.team_id = ? AND ts.name = 'LATE' AND t.visible = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class, teamId);
    }

    // Member status breakdown by sprint
    public List<Map<String, Object>> getMemberStatusBreakdown(int teamId, int sprintId) {
        String sql = "SELECT \r\n" + //
                "    u.name AS user_name, \r\n" + //
                "    COUNT(CASE WHEN ts.name = 'DONE' THEN 1 END) AS completed_tasks,\r\n" + //
                "    COUNT(CASE WHEN ts.name = 'LATE' THEN 1 END) AS late_tasks,\r\n" + //
                "    COUNT(CASE WHEN ts.name IN ('PENDING', 'ON GOING') AND t.visible = 1 THEN 1 END) AS pending_tasks\r\n"
                + //
                "FROM APP_USER u\r\n" + //
                "LEFT JOIN TASKS t \r\n" + //
                "    ON t.user_id = u.id \r\n" + //
                "    AND t.sprint_id = ?\r\n" + //
                "LEFT JOIN TASK_STATE ts \r\n" + //
                "    ON ts.id = t.state_id\r\n" + //
                "WHERE u.team_id = ?\r\n" + //
                "GROUP BY u.id, u.name;";
        return jdbcTemplate.query(sql, new Object[] { sprintId, teamId }, (rs, rowNum) -> Map.of(
                "user_name", rs.getString("user_name"),
                "completed_tasks", rs.getInt("completed_tasks"),
                "late_tasks", rs.getInt("late_tasks"),
                "pending_tasks", rs.getInt("pending_tasks")));
    }

    // Members real work hours by sprint
    public List<Map<String, Object>> getMemberWorkHoursBySprint(int teamId, int sprintId) {
        String sql = "SELECT \r\n" + //
                "    u.id AS user_id, \r\n" + //
                "    u.name AS user_name, \r\n" + //
                "    COALESCE(SUM(t.spent_hours), 0) AS total_work_hours\r\n" + //
                "FROM APP_USER u\r\n" + //
                "LEFT JOIN TASKS t \r\n" + //
                "    ON t.user_id = u.id \r\n" + //
                "    AND t.sprint_id = ?\r\n" + //
                "WHERE u.team_id = ?\r\n" + //
                "  AND t.visible = 1\r\n" + //
                "GROUP BY u.id, u.name;";
        return jdbcTemplate.query(sql, new Object[] { sprintId, teamId }, (rs, rowNum) -> Map.of(
                "user_name", rs.getString("user_name"),
                "total_work_hours", rs.getInt("total_work_hours")));
    }

    // AVE tasks per status by sprint and team
    public List<Map<String, Object>> getAverageTasksPerStatus(int teamId) {
        String sql = "SELECT \r\n" + //
                "    u.id AS user_id,\r\n" + //
                "    u.name AS user_name,\r\n" + //
                "\r\n" + //
                "    AVG(completed) AS avg_completed_tasks,\r\n" + //
                "    AVG(late) AS avg_late_tasks,\r\n" + //
                "    AVG(pending) AS avg_pending_tasks\r\n" + //
                "\r\n" + //
                "FROM (\r\n" + //
                "    SELECT \r\n" + //
                "        t.user_id,\r\n" + //
                "        t.sprint_id,\r\n" + //
                "\r\n" + //
                "        SUM(CASE WHEN ts.name = 'DONE' THEN 1 ELSE 0 END) AS completed,\r\n" + //
                "        SUM(CASE WHEN ts.name = 'LATE' THEN 1 ELSE 0 END) AS late,\r\n" + //
                "        SUM(CASE WHEN ts.name IN ('PENDING', 'ON GOING') AND t.visible = 1 THEN 1 ELSE 0 END) AS pending\r\n"
                + //
                "\r\n" + //
                "    FROM TASKS t\r\n" + //
                "    JOIN TASK_STATE ts ON ts.id = t.state_id\r\n" + //
                "    JOIN SPRINT s ON s.id = t.sprint_id\r\n" + //
                "    WHERE s.team_id = ?\r\n" + //
                "      AND t.visible = 1\r\n" + //
                "\r\n" + //
                "    GROUP BY t.user_id, t.sprint_id\r\n" + //
                ") sprint_stats\r\n" + //
                "\r\n" + //
                "JOIN APP_USER u ON u.id = sprint_stats.user_id\r\n" + //
                "\r\n" + //
                "GROUP BY u.id, u.name;";
        return jdbcTemplate.query(sql, new Object[] { teamId }, (rs, rowNum) -> Map.of(
                "user_name", rs.getString("user_name"),
                "avg_completed_tasks", rs.getDouble("avg_completed_tasks"),
                "avg_late_tasks", rs.getDouble("avg_late_tasks"),
                "avg_pending_tasks", rs.getDouble("avg_pending_tasks"),
                "avg_total_tasks", rs.getDouble("avg_completed_tasks") + rs.getDouble("avg_late_tasks")
                        + rs.getDouble("avg_pending_tasks")));
    }

    // Completed tasks per member per sprint (team-wide)
    public List<Map<String, Object>> getCompletedTasksByMemberPerSprint(int teamId) {
        String sql = "SELECT \r\n" + //
                "    s.id AS sprint_id,\r\n" + //
                "    s.SPRINT_NUM AS sprint_name,\r\n" + //
                "    u.id AS user_id,\r\n" + //
                "    u.name AS user_name,\r\n" + //
                "    COUNT(CASE WHEN ts.name = 'DONE' THEN 1 END) AS completed_tasks\r\n" + //
                "FROM SPRINT s\r\n" + //
                "JOIN APP_USER u ON u.team_id = s.team_id\r\n" + //
                "LEFT JOIN TASKS t\r\n" + //
                "    ON t.sprint_id = s.id\r\n" + //
                "    AND t.user_id = u.id\r\n" + //
                "    AND t.visible = 1\r\n" + //
                "LEFT JOIN TASK_STATE ts\r\n" + //
                "    ON ts.id = t.state_id\r\n" + //
                "WHERE s.team_id = ?\r\n" + //
                "GROUP BY s.id, s.SPRINT_NUM, u.id, u.name\r\n" + //
                "ORDER BY s.SPRINT_NUM, u.name;";

        return jdbcTemplate.query(sql, new Object[] { teamId }, (rs, rowNum) -> Map.of(
                "sprint_id", rs.getInt("sprint_id"),
                "sprint_name", rs.getString("sprint_name"),
                "user_id", rs.getInt("user_id"),
                "user_name", rs.getString("user_name"),
                "completed_tasks", rs.getInt("completed_tasks")));
    }

    // Total worked hours per member per sprint (team-wide)
    public List<Map<String, Object>> getWorkHoursByMemberPerSprint(int teamId) {
        String sql = "SELECT \r\n" + //
                "    s.id AS sprint_id,\r\n" + //
                "    s.SPRINT_NUM AS sprint_name,\r\n" + //
                "    u.id AS user_id,\r\n" + //
                "    u.name AS user_name,\r\n" + //
                "    COALESCE(SUM(t.spent_hours), 0) AS total_work_hours\r\n" + //
                "FROM SPRINT s\r\n" + //
                "JOIN APP_USER u ON u.team_id = s.team_id\r\n" + //
                "LEFT JOIN TASKS t\r\n" + //
                "    ON t.sprint_id = s.id\r\n" + //
                "    AND t.user_id = u.id\r\n" + //
                "    AND t.visible = 1\r\n" + //
                "WHERE s.team_id = ?\r\n" + //
                "GROUP BY s.id, s.SPRINT_NUM, u.id, u.name\r\n" + //
                "ORDER BY s.SPRINT_NUM, u.name;";

        return jdbcTemplate.query(sql, new Object[] { teamId }, (rs, rowNum) -> Map.of(
                "sprint_id", rs.getInt("sprint_id"),
                "sprint_name", rs.getString("sprint_name"),
                "user_id", rs.getInt("user_id"),
                "user_name", rs.getString("user_name"),
                "total_work_hours", rs.getInt("total_work_hours")));
    }

    // AVG hours per sprint by team
    public List<Map<String, Object>> getAverageWorkHoursPerSprint(int teamId) {
        String sql = "SELECT \r\n" + //
                "    u.id AS user_id,\r\n" + //
                "    u.name AS user_name,\r\n" + //
                "    AVG(total_hours) AS avg_hours_per_sprint\r\n" + //
                "FROM (\r\n" + //
                "    SELECT \r\n" + //
                "        t.user_id,\r\n" + //
                "        t.sprint_id,\r\n" + //
                "        COALESCE(SUM(t.spent_hours), 0) AS total_hours\r\n" + //
                "    FROM TASKS t\r\n" + //
                "    JOIN SPRINT s ON s.id = t.sprint_id\r\n" + //
                "    WHERE s.team_id = ?\r\n" + //
                "      AND t.visible = 1\r\n" + //
                "    GROUP BY t.user_id, t.sprint_id\r\n" + //
                ") sprint_hours\r\n" + //
                "JOIN APP_USER u ON u.id = sprint_hours.user_id\r\n" + //
                "GROUP BY u.id, u.name;";
        return jdbcTemplate.query(sql, new Object[] { teamId }, (rs, rowNum) -> Map.of(
                "user_name", rs.getString("user_name"),
                "avg_hours_per_sprint", rs.getDouble("avg_hours_per_sprint")));
    }

}
