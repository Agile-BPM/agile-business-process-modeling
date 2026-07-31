package com.project.pmdagile.auth.jira;

import com.project.pmdagile.auth.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class JiraCloudId {

    @Id
    @GeneratedValue
    private Integer id;
    private String cloudId;
    private LocalDateTime createdAt;
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;
}
