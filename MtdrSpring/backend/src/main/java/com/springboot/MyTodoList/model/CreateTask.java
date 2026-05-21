package com.springboot.MyTodoList.model;

import java.math.BigDecimal;

public class CreateTask {
    private int assigneeId;
    private String name;
    private String description;
    private int sprintId;
    private int priority;
    private String attachment;
    private BigDecimal estimatedHours;

    public CreateTask() {
    }

    private CreateTask(Builder builder) {
        this.assigneeId = builder.assigneeId;
        this.name = builder.name;
        this.description = builder.description;
        this.sprintId = builder.sprintId;
        this.priority = builder.priority;
        this.attachment = builder.attachment;
        this.estimatedHours = builder.estimatedHours;
    }

    public static Builder builder() {
        return new Builder();
    }

    public int getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(int assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getSprintId() {
        return sprintId;
    }

    public void setSprintId(int sprintId) {
        this.sprintId = sprintId;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getAttachment() {
        return attachment;
    }

    public void setAttachment(String attachment) {
        this.attachment = attachment;
    }

    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public static final class Builder {
        private int assigneeId;
        private String name;
        private String description;
        private int sprintId;
        private int priority;
        private String attachment;
        private BigDecimal estimatedHours;

        private Builder() {
        }

        public Builder assigneeId(int assigneeId) {
            this.assigneeId = assigneeId;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder sprintId(int sprintId) {
            this.sprintId = sprintId;
            return this;
        }

        public Builder priority(int priority) {
            this.priority = priority;
            return this;
        }

        public Builder attachment(String attachment) {
            this.attachment = attachment;
            return this;
        }

        public Builder estimatedHours(BigDecimal estimatedHours) {
            this.estimatedHours = estimatedHours;
            return this;
        }

        public CreateTask build() {
            return new CreateTask(this);
        }
    }
}
