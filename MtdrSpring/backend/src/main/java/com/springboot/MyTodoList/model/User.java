package com.springboot.MyTodoList.model;

public class User {
    private final int id;
    private final String username;
    private final String email;
    private final int teamId;
    private final String role;

    public User(Builder builder) {
        this.id = builder.id;
        this.username = builder.username;
        this.email = builder.email;
        this.teamId = builder.teamId;
        this.role = builder.role;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public int getTeamId() {
        return teamId;
    }

    public String getRole() {
        return role;
    }

    public static class Builder {
        int id;
        String username;
        String email;
        int teamId;
        String role;

        public Builder setId(int id) {
            this.id = id;
            return this;
        }

        public Builder setUsername(String username) {
            this.username = username;
            return this;
        }

        public Builder setEmail(String email) {
            this.email = email;
            return this;
        }

        public Builder setTeamId(int teamId) {
            this.teamId = teamId;
            return this;
        }

        public Builder setRole(String role) {
            this.role = role;
            return this;
        }

        public User build() {
            return new User(this);
        }
    }
}
