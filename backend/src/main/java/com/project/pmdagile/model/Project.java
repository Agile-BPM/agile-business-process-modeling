package com.project.pmdagile.model;

import com.project.pmdagile.auth.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Project extends BaseEntity {
    private String name;
    private String description;
    private String jiraProjectKey;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Sprint> sprints = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_shared_users",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> sharedWith = new LinkedHashSet<>();

    public void addSprint(Sprint sprint) {
        sprint.setProject(this);
        sprints.add(sprint);
    }

    public void linkToJiraProject(String projectKey) {
        this.jiraProjectKey = projectKey;
    }

    public boolean isLinkedToJiraProject() {
        return this.jiraProjectKey != null && !this.jiraProjectKey.isEmpty();
    }

    public void shareWith(User user) {
        sharedWith.add(user);
    }
}
