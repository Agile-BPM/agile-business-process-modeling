package com.project.pmdagile.auth.jira;

import com.project.pmdagile.auth.ConfirmRequest;
import com.project.pmdagile.auth.InitiateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("oauth")
@RequiredArgsConstructor
@Tag(name = "Jira OAuth 2.0 (3LO) Controller")
public class OAuthController {

    private final IJiraOAuthService jiraOAuthService;

    @PostMapping("initiate")
    public ResponseEntity<String> initiate(@RequestBody InitiateRequest request) {
        return ResponseEntity.ok(jiraOAuthService.generateJiraRedirectUrl(request.getEmail()));
    }

    @PostMapping("complete")
    public ResponseEntity<Void> complete(@RequestBody ConfirmRequest request) {
        jiraOAuthService.handleJiraCallback(request.getCode(), request.getState());
        return ResponseEntity.noContent().build();
    }
}
