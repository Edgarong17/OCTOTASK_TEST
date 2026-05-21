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



@RestController
@RequestMapping("/api/filter")

public class FilterController {

    private final FilterService filterService;

    public FilterController(FilterService filterService) {
        this.filterService = filterService;
    }
    

    @GetMapping("/sprints/{teamId}")
    public ResponseEntity<?> getAllSprints(@PathVariable Long teamId) {
        try{
            var sprints = filterService.getAllSprintsByTeamId(teamId);
            return ResponseEntity.ok(sprints);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }

    @GetMapping("/team-members/{teamId}")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long teamId) {
        try {
            var teamMembers = filterService.getTeamMembersByTeamId(teamId);
            return ResponseEntity.ok(teamMembers);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }
}
