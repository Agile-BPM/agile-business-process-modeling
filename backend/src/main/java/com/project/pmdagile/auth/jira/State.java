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
public class State {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(unique = true)
    private String stateId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    // todo: wie geht man um mit bereits benutzten tokens? löschen? boolean used?

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;
}
