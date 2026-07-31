package com.project.pmdagile.repository;

import com.project.pmdagile.AbstractIntegrationTest;
import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.auth.user.UserRepository;
import com.project.pmdagile.model.BpmnModel;
import com.project.pmdagile.model.Project;
import com.project.pmdagile.model.Sprint;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.Rollback;

import static com.project.pmdagile.JUnitTags.INTEGRATION_TEST;
import static org.assertj.core.api.Assertions.assertThat;

@Tag(INTEGRATION_TEST)
@Transactional
@Rollback
class BpmnModelRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    protected BpmnModelRepository underTest;
    @Autowired
    protected UserRepository userRepository;
    @Autowired
    protected ProjectRepository projectRepository;
    @Autowired
    protected SprintRepository sprintRepository;

    @Test
    public void saveBpmnModelTest() {
        Sprint sprint = saveSprint();
        BpmnModel bpmnModel = new BpmnModel();
        bpmnModel.setName("Test Model");
        bpmnModel.setBpmnXml("<bpmn:definitions></bpmn:definitions>");
        bpmnModel.setSprint(sprint);

        BpmnModel savedModel = underTest.save(bpmnModel);

        assertThat(savedModel.getId()).isNotNull();
        assertThat(savedModel.getName()).isEqualTo("Test Model");
        assertThat(savedModel.getBpmnXml()).isEqualTo("<bpmn:definitions></bpmn:definitions>");
        assertThat(savedModel.getSprint().getId()).isEqualTo(sprint.getId());
    }

    @Test
    public void findAllBySprintIdTest() {
        Sprint sprint1 = saveSprint();
        BpmnModel bpmnModel1 = new BpmnModel();
        bpmnModel1.setName("Sprint Model 1");
        bpmnModel1.setBpmnXml("<bpmn:definitions></bpmn:definitions>");
        bpmnModel1.setSprint(sprint1);
        underTest.save(bpmnModel1);

        Sprint sprint2 = saveSprint();
        BpmnModel bpmnModel2 = new BpmnModel();
        bpmnModel2.setName("Sprint Model 2");
        bpmnModel2.setBpmnXml("<bpmn:definitions></bpmn:definitions>");
        bpmnModel2.setSprint(sprint2);
        underTest.save(bpmnModel2);

        var models = underTest.findAllBySprintIdOrderByIdAsc(sprint1.getId());

        assertThat(models).hasSize(1);
        assertThat(models).first().extracting(BpmnModel::getName).isEqualTo(bpmnModel1.getName());
        assertThat(models).first().extracting(BpmnModel::getBpmnXml).isEqualTo(bpmnModel1.getBpmnXml());
        assertThat(models).first().extracting(BpmnModel::getSprint).isEqualTo(sprint1);
    }

    private User saveUser() {
        return userRepository.save(new User());
    }

    private Sprint saveSprint() {
        User owner = saveUser();
        Project project = new Project();
        project.setName("Project");
        project.setDescription("Description");
        project.setOwner(owner);
        Project savedProject = projectRepository.save(project);

        Sprint sprint = new Sprint();
        sprint.setName("Sprint");
        sprint.setStatus("active");
        sprint.setProject(savedProject);
        return sprintRepository.save(sprint);
    }

}
