package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraIssueDescription {
    private String type;
    private String version;
    private List<JiraContent> content;

    public String getPlainText() {
        StringBuilder sb = new StringBuilder();
        appendContent(content, sb);
        return sb.toString().trim();
    }

    private void appendContent(List<JiraContent> contents, StringBuilder sb) {
        for (JiraContent c : contents) {
            if ("text".equals(c.getType()) && c.getText() != null) {
                sb.append(c.getText()).append(" ");
            }
            if (c.getContent() != null) {
                appendContent(c.getContent(), sb);
            }
        }
    }
}
