package com.springboot.MyTodoList.services;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.util.Map;
import com.springboot.MyTodoList.model.User;

@Service
public class UserService {
    private final JdbcTemplate jdbcTemplate;

    public UserService(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    public User loginUser(Map<String, Object> userData) {
        String user = stringValue(userData, "email");
        if (isBlank(user)) {
            user = stringValue(userData, "username");
        }
        String password = (String) userData.get("password");
        requireNotBlank(user, "username or email");
        requireNotBlank(password, "password");

        String sql = "SELECT a.id, u.name, a.email, u.team_id, u.role FROM AUTH a JOIN APP_USER u ON a.id = u.id WHERE (a.email = ? OR u.name = ?) AND a.password = ?";
        return jdbcTemplate.query(sql, new Object[]{user, user, password}, rs -> {
            if (rs.next()) {
                return new User.Builder()
                        .setId(rs.getInt("id"))
                        .setUsername(rs.getString("name"))
                        .setEmail(rs.getString("email"))
                        .setTeamId(rs.getInt("team_id"))
                        .setRole(rs.getString("role"))
                        .build();
            }
            return null; // No matching user found
        });
    }

    @Transactional
    public User createUser(Map<String, Object> userData) {
        String username = stringValue(userData, "username");
        String email = stringValue(userData, "email");
        String password = stringValue(userData, "password");
        String role = stringValue(userData, "role");
        if (isBlank(role)) {
            role = "user";
        }

        requireNotBlank(username, "username");
        requireNotBlank(email, "email");
        requireNotBlank(password, "password");

        Integer authId = insertAndReturnId("INSERT INTO AUTH (email, password) VALUES (?, ?)", email, password);

        String sql = "INSERT INTO APP_USER (id, name, role, team_id) VALUES (?, ?, ?, ?)";

        int rows = jdbcTemplate.update(sql, authId, username, role, null);
        
        if (rows > 0) {
            Integer teamId = null;

            if (role.equalsIgnoreCase("admin")) {
                teamId = insertAndReturnId("INSERT INTO TEAMS (manager_id) VALUES (?)", authId);
                if (teamId != null) {
                    String updateTeamSql = "UPDATE APP_USER SET team_id = ? WHERE id = ?";
                    jdbcTemplate.update(updateTeamSql, teamId, authId);
                }
            }

            User user = new User.Builder()
                    .setId(authId != null ? authId : 0)
                    .setUsername(username)
                    .setEmail(email)
                    .setTeamId(teamId != null ? teamId : 0)
                    .setRole(role)
                    .build();
            return user;
        }
        return null;
    }

    public boolean createTeam(Map<String, Object> teamData) {
        String teamName = (String) teamData.get("teamName");
        String sql = "INSERT INTO TEAMS (name) VALUES (?)";
        int rows = jdbcTemplate.update(sql, teamName);
        return rows > 0;
    }

    public boolean checkDuplicates(Map<String, Object> userData) {
        String username = stringValue(userData, "username");
        String email = stringValue(userData, "email");

        requireNotBlank(username, "username");
        requireNotBlank(email, "email");

        String sql = "SELECT COUNT(*) FROM APP_USER WHERE name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, username);
        if (count != null && count > 0) {
            return false; // Username already exists
        }

        sql = "SELECT COUNT(*) FROM AUTH WHERE email = ?";

        count = jdbcTemplate.queryForObject(sql, Integer.class, email);

        if (count != null && count > 0) {
            return false; // Email already exists
        }

        return true; // Both username and email are available
    }

    private Integer insertAndReturnId(String sql, Object... params) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        int rows = jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"ID"});
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            return ps;
        }, keyHolder);

        if (rows == 0 || keyHolder.getKey() == null) {
            return null;
        }
        return keyHolder.getKey().intValue();
    }

    private String stringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value == null ? null : value.toString().trim();
    }

    private void requireNotBlank(String value, String fieldName) {
        if (isBlank(value)) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
