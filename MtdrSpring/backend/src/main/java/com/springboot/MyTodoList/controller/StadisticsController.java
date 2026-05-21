package com.springboot.MyTodoList.controller;

import org.hibernate.annotations.Fetch;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.springboot.MyTodoList.services.TaskService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import com.springboot.MyTodoList.services.FilterService;
import com.springboot.MyTodoList.services.StadisticsService;

@RestController
@RequestMapping("/api/analytics")

public class StadisticsController {

    private final StadisticsService stadisticsService;

    public StadisticsController(StadisticsService stadisticsService) {
        this.stadisticsService = stadisticsService;
    }

    @GetMapping("/numtasks/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getNumTasks(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            Integer numTasks = stadisticsService.getNumTasksBySprintId(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("num_tasks", numTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/numtasks/all/{teamId}")
    public ResponseEntity<Map<String, Object>> getNumTasksAll(
            @PathVariable String teamId) {
        try {
            Integer numTasks = stadisticsService.getNumTasksByTeamId(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("num_tasks", numTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/completedtasks/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getNumCompletedTasks(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            Integer numCompletedTasks = stadisticsService.getNumCompletedTasksBySprintId(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("num_completed_tasks", numCompletedTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/completedtasks/all/{teamId}")
    public ResponseEntity<Map<String, Object>> getNumCompletedTasksAll(
            @PathVariable String teamId) {
        try {
            Integer numCompletedTasks = stadisticsService.getNumCompletedTasksByTeamId(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("num_completed_tasks", numCompletedTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/pendingtasks/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getNumPendingTasks(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            Integer numPendingTasks = stadisticsService.getNumPendingTasksBySprintId(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("num_pending_tasks", numPendingTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/pendingtasks/all/{teamId}")
    public ResponseEntity<Map<String, Object>> getNumPendingTasksAll(
            @PathVariable String teamId) {
        try {
            Integer numPendingTasks = stadisticsService.getNumPendingTasksByTeamId(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("num_pending_tasks", numPendingTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/latetasks/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getLateTasks(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            Integer numLateTasks = stadisticsService.getLateTasksBySprintId(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("num_late_tasks", numLateTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/latetasks/all/{teamId}")
    public ResponseEntity<Map<String, Object>> getLateTasksAll(
            @PathVariable String teamId) {
        try {
            Integer numLateTasks = stadisticsService.getLateTasksByTeamId(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("num_late_tasks", numLateTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/memberstatus/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getMemberStatusBreak(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            var breakdown = stadisticsService.getMemberStatusBreakdown(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("member_status_breakdown", breakdown));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/workhours/{teamId}/{sprintId}")
    public ResponseEntity<Map<String, Object>> getWorkHours(
            @PathVariable String teamId,
            @PathVariable String sprintId) {
        try {
            var workHours = stadisticsService.getMemberWorkHoursBySprint(Integer.parseInt(teamId),
                    Integer.parseInt(sprintId));
            return ResponseEntity.ok(Map.of("work_hours", workHours));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/avgtasks/{teamId}")
    public ResponseEntity<Map<String, Object>> getAverageTasksPerStatusPerTeam(
            @PathVariable String teamId) {
        try {
            var avgTasks = stadisticsService.getAverageTasksPerStatus(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("avg_tasks_per_member", avgTasks));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/avghours/{teamId}")
    public ResponseEntity<Map<String, Object>> getAverageHoursPerMember(
            @PathVariable String teamId) {
        try {
            var avgHours = stadisticsService.getAverageWorkHoursPerSprint(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("avg_hours_per_member", avgHours));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/completedtasks/bymember/sprints/{teamId}")
    public ResponseEntity<Map<String, Object>> getCompletedTasksByMemberPerSprint(
            @PathVariable String teamId) {
        try {
            var completed = stadisticsService.getCompletedTasksByMemberPerSprint(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("completed_tasks_by_member_per_sprint", completed));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/workhours/bymember/sprints/{teamId}")
    public ResponseEntity<Map<String, Object>> getWorkHoursByMemberPerSprint(
            @PathVariable String teamId) {
        try {
            var hours = stadisticsService.getWorkHoursByMemberPerSprint(Integer.parseInt(teamId));
            return ResponseEntity.ok(Map.of("work_hours_by_member_per_sprint", hours));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

}
