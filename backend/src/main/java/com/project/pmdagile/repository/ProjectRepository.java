package com.project.pmdagile.repository;

import com.project.pmdagile.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
