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
public class JiraAccessToken {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(length = 4096)
    private String accessToken;
    @Column(length = 2048)
    private String refreshToken;
    private Integer expiresIn;
    private LocalDateTime createdAt;
    private String scope;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(createdAt.plusSeconds(expiresIn));
    }
}
