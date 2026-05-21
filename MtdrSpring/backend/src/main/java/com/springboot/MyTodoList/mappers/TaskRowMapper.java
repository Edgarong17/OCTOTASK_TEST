package com.springboot.MyTodoList.mappers;

import com.springboot.MyTodoList.model.Task;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;

public class TaskRowMapper implements RowMapper<Task> {
    @Override
    public Task mapRow(ResultSet rs, int rowNum) throws SQLException {
        Task task = new Task();
        task.setID(rs.getInt("ID"));
        task.setName(rs.getString("NAME"));
        task.setDescription(rs.getString("DESCRIPTION"));
        task.setUserID(rs.getInt("USER_ID"));
        task.setUserName(rs.getString("userName"));
        task.setSprintID(rs.getInt("SPRINT_ID"));
        task.setSprintNumber(rs.getInt("sprintNumber"));
        task.setStateID(rs.getInt("STATE_ID"));
        task.setPriorityID(rs.getInt("PRIORITY_ID"));
        task.setLinkToFile(rs.getString("LINK_TO_FILE"));
        task.setSprintEndDate(rs.getTimestamp("sprintEndDate") != null ?
                rs.getTimestamp("sprintEndDate").toLocalDateTime().atOffset(OffsetDateTime.now().getOffset()) : null);


        if (rs.getTimestamp("CREATED_AT") != null) {
            task.setCreatedAt(
                    rs.getTimestamp("CREATED_AT").toLocalDateTime().atOffset(OffsetDateTime.now().getOffset()));
        }
        if (rs.getTimestamp("UPDATED_AT") != null) {
            task.setUpdatedAt(
                    rs.getTimestamp("UPDATED_AT").toLocalDateTime().atOffset(OffsetDateTime.now().getOffset()));
        }

        task.setCost(rs.getBigDecimal("COST"));
        task.setSpentHours(rs.getBigDecimal("SPENT_HOURS"));
        task.setVisibility(rs.getInt("VISIBILITY"));

        return task;
    }
}
