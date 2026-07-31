package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraSprint {
    private int id;
    private String name;
    private String state;
    private int boardId;
    private String goal;
    private String startDate;
    private String endDate;
}
