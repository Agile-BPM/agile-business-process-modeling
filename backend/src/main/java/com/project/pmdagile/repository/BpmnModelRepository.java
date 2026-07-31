package com.project.pmdagile.repository;

import com.project.pmdagile.model.BpmnModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BpmnModelRepository extends JpaRepository<BpmnModel, Long> {
    List<BpmnModel> findAllBySprintIdOrderByIdAsc(Long sprintId);
}
