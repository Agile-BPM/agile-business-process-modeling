package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraIssueFields {
    private String statuscategorychangedate;
    private JiraIssueType issuetype;
    private JiraIssue parent;
    private List<Object> components;
    private Long timespent;
    private Long timeoriginalestimate;
    private JiraIssueDescription description;
    private JiraProject project;
    private List<Object> fixVersions;
    private JiraStatusCategory statusCategory;
    private Long aggregatetimespent;
    private Object resolution;
    private Object security;
    private Long aggregatetimeestimate;
    private String resolutiondate;
    private int workratio;
    private String summary;
    private JiraWatches watches;
    private String lastViewed;
    private JiraUser creator;
    private List<JiraIssue> subtasks;
    private String created;
    private List<JiraSprint> customfield10020;
    private JiraUser reporter;
    private JiraProgress aggregateprogress;
    private JiraPriority priority;
    private List<String> labels;
    private String environment;
    private Long timeestimate;
    private Long aggregatetimeoriginalestimate;
    private List<Object> versions;
    private String duedate;
    private JiraProgress progress;
    private JiraVotes votes;
    private List<Object> issuelinks;
    private JiraUser assignee;
    private String updated;
    private JiraStatus status;
}
