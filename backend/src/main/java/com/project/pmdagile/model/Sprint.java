package com.project.pmdagile.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

import static java.time.LocalDate.now;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Sprint extends BaseEntity {
    private String name;
    private String status; // e.g., "active", "completed"
    private String startDate;
    private String endDate;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "sprint", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @OrderBy("createdAt = ASC")
    private List<BpmnModel> bpmnModels = new ArrayList<>();

    public void endSprint() {
        this.status = "completed";
        this.endDate = now().toString();
    }

    public void addBpmnModel(BpmnModel bpmnModel) {
        bpmnModel.setSprint(this);
        bpmnModels.add(bpmnModel);
    }

    public BpmnModel getCurrentBpmnModel() {
        if (bpmnModels.isEmpty()) {
            return null;
        }
        return bpmnModels.getLast();
    }
}
