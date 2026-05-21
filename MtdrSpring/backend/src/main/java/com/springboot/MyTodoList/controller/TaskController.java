package com.springboot.MyTodoList.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.springboot.MyTodoList.model.CreateTask;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.services.TaskService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    private static String rootCauseMessage(Throwable throwable) {
        if (throwable == null)
            return "Unknown error";
        Throwable current = throwable;
        String bestMessage = null;

        while (current != null) {
            String msg = current.getMessage();
            if (msg != null && !msg.isBlank()) {
                bestMessage = msg;
            }
            current = current.getCause();
        }

        if (bestMessage != null)
            return bestMessage;
        return throwable.getClass().getSimpleName();
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getTeamTasks(@PathVariable int teamId) {
        try {
            var tasks = taskService.getTasksByTeamId(teamId);
            return ResponseEntity.ok(tasks);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "error", ex.getClass().getSimpleName(),
                            "message", rootCauseMessage(ex)));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTasks(@PathVariable int userId) {
        try {
            var tasks = taskService.getTasksByUserId(userId);
            return ResponseEntity.ok(tasks);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "error", ex.getClass().getSimpleName(),
                            "message", rootCauseMessage(ex)));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewTask(@RequestBody CreateTask taskData) {
        try {
            var createdTask = taskService.createTask(taskData);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "error", ex.getClass().getSimpleName(),
                            "message", rootCauseMessage(ex)));
        }
    }

    @PutMapping("/update/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable int taskId, @RequestBody Task taskData) {
        try {
            var updatedTask = taskService.updateTask(taskId, taskData);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "error", ex.getClass().getSimpleName(),
                            "message", rootCauseMessage(ex)));
        }
    }

    @PutMapping("/delete/{taskId}")
    public ResponseEntity<?> deleteTaskLogically(@PathVariable int taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Task deleted successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "error", ex.getClass().getSimpleName(),
                            "message", rootCauseMessage(ex)));
        }
    }
}
