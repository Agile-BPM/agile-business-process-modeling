package com.project.pmdagile.auth.jira;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class JiraGetCloudIdResponse {
    private String id;
    private String name;
    private String url;
    private List<String> scopes;
    private String avatarUrl;
}
