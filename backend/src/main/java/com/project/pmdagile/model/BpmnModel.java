package com.project.pmdagile.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class BpmnModel extends BaseEntity {
    private String name;
    @Lob
    private String bpmnXml;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;
}
