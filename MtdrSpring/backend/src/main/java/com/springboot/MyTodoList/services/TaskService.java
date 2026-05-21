package com.springboot.MyTodoList.services;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.util.List;

import com.springboot.MyTodoList.mappers.TaskRowMapper;
import com.springboot.MyTodoList.model.CreateTask;
import com.springboot.MyTodoList.model.Task;

@Service
public class TaskService {
    private final JdbcTemplate jdbcTemplate;

    public TaskService(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    public Object getTasksByTeamId(int teamId) {
        String sql = "SELECT t.*, u.name as userName, s.end_date as sprintEndDate, s.SPRINT_NUM as sprintNumber FROM TASKS t JOIN APP_USER u ON t.user_id = u.id JOIN SPRINT s ON t.sprint_id = s.id WHERE u.team_id = ? AND t.visible = 1";
        return jdbcTemplate.query(sql, new Object[] { teamId }, new TaskRowMapper());
    }

    public List<Task> getTasksByUserId(int userId) {
        String sql = "SELECT t.*, u.name as userName, s.end_date as sprintEndDate, s.SPRINT_NUM as sprintNumber  FROM TASKS t JOIN APP_USER u ON t.user_id = u.id JOIN SPRINT s ON t.sprint_id = s.id WHERE t.user_id = ? AND t.visible = 1";
        return jdbcTemplate.query(sql, new Object[] { userId }, new TaskRowMapper());
    }

    public Task createTask(CreateTask taskData) {

        int visibility = 1;
        int stateId = 2;
        BigDecimal spentHours = BigDecimal.ZERO;
        BigDecimal estimatedHours = taskData.getEstimatedHours() != null ? taskData.getEstimatedHours()
                : BigDecimal.ZERO;

        String insertSql = "INSERT INTO TASKS (USER_ID, NAME, DESCRIPTION, SPRINT_ID, PRIORITY_ID, LINK_TO_FILE, CREATED_AT, UPDATED_AT, COST, SPENT_HOURS, VISIBILITY, STATE_ID) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        int rows = jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertSql, new String[] { "ID" });
            ps.setInt(1, taskData.getAssigneeId());
            ps.setString(2, taskData.getName());
            ps.setString(3, taskData.getDescription());
            ps.setInt(4, taskData.getSprintId());
            ps.setInt(5, taskData.getPriority());
            ps.setString(6, taskData.getAttachment());
            ps.setBigDecimal(7, estimatedHours);
            ps.setBigDecimal(8, spentHours);
            ps.setInt(9, visibility);
            ps.setInt(10, stateId);
            return ps;
        }, keyHolder);

        if (rows == 0 || keyHolder.getKey() == null) {
            throw new IllegalStateException("Task insert succeeded but generated ID was not returned");
        }

        return getTaskById(keyHolder.getKey().intValue());
    }

    public Task getTaskById(int taskId) {

        String sql = "SELECT t.*, u.name as userName, s.end_date as sprintEndDate, s.SPRINT_NUM as sprintNumber FROM TASKS t LEFT JOIN APP_USER u ON t.user_id = u.id LEFT JOIN SPRINT s ON t.sprint_id = s.id WHERE t.id = ?";

        return jdbcTemplate.queryForObject(sql, new TaskRowMapper(), taskId);
    }

    public Task updateTask(int taskId, Task taskData) {
        String sql = "UPDATE TASKS SET USER_ID = ?, NAME = ?, DESCRIPTION = ?, SPRINT_ID = ?, STATE_ID = ?, PRIORITY_ID = ?, LINK_TO_FILE = ?, UPDATED_AT = CURRENT_TIMESTAMP, COST = ?, SPENT_HOURS = ?, VISIBILITY = ? WHERE ID = ?";
        int rowsAffected = jdbcTemplate.update(sql, taskData.getUserID(), taskData.getName(),
                taskData.getDescription(), taskData.getSprintID(), taskData.getStateID(), taskData.getPriorityID(),
                taskData.getLinkToFile(), taskData.getCost(), taskData.getSpentHours(), taskData.getVisibility(), taskId);
        if (rowsAffected == 0) {
            throw new IllegalStateException("No task found with ID: " + taskId);
        }
        return getTaskById(taskId);
    }

    public void deleteTask(int taskId) {
        String sql = "UPDATE TASKS SET Visible = 0 WHERE ID = ?";
        int rowsAffected = jdbcTemplate.update(sql, taskId);
        if (rowsAffected == 0) {
            throw new IllegalStateException("No task found with ID: " + taskId);
        }
    }        
}
