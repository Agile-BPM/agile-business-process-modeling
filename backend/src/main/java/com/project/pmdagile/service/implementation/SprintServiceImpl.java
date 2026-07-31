package com.project.pmdagile.service.implementation;

import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.dto.bpmn.SprintDto;
import com.project.pmdagile.dto.requests.CreateSprintRequestDto;
import com.project.pmdagile.mapper.BpmnModelMapper;
import com.project.pmdagile.mapper.SprintMapper;
import com.project.pmdagile.model.BpmnModel;
import com.project.pmdagile.model.Project;
import com.project.pmdagile.model.Sprint;
import com.project.pmdagile.repository.BpmnModelRepository;
import com.project.pmdagile.repository.ProjectRepository;
import com.project.pmdagile.repository.SprintRepository;
import com.project.pmdagile.service.ISprintService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.time.LocalDateTime.now;

@Service
@Slf4j
@RequiredArgsConstructor
public class SprintServiceImpl implements ISprintService {

    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final BpmnModelRepository bpmnModelRepository;
    private final SprintMapper sprintMapper;
    private final BpmnModelMapper bpmnModelMapper;

    @Override
    @Transactional
    public List<SprintDto> getSprintsByProjectId(Long projectId) {
        return sprintRepository.findAllByProjectIdOrderByStartDateAsc(projectId).stream()
                .map(sprintMapper::toSprintDto)
                .toList();
    }

    @Override
    @Transactional
    public SprintDto getSprintById(Long id) {
        return sprintRepository.findById(id)
                .map(sprintMapper::toSprintDto)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
    }

    @Override
    @Transactional
    public Long createSprint(CreateSprintRequestDto request, Authentication connectedUser) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        List<Sprint> allSprints = sprintRepository.findAllByProjectIdOrderByStartDateAsc(request.projectId());
        if (!allSprints.isEmpty()) {
            Sprint lastSprint = allSprints.getLast();
            lastSprint.endSprint();
            sprintRepository.save(lastSprint);

            Sprint sprint = createAndSaveSprint(request, project);
            createAndSaveInitialBpmnModel(lastSprint.getCurrentBpmnModel().getBpmnXml(), sprint);
            return sprint.getId();
        }
        Sprint sprint = createAndSaveSprint(request, project);
        createAndSaveInitialBpmnModel(request.initialBpmnModelXml(), sprint);
        return sprint.getId();
    }

    @Override
    @Transactional
    public SprintDto updateSprint(Long id, SprintDto updatedSprintDto) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
        sprint.setName(updatedSprintDto.name());
        return sprintMapper.toSprintDto(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public void deleteSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
        sprintRepository.delete(sprint);
    }

    @Override
    @Transactional
    public SprintDto endSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
        sprint.endSprint();
        return sprintMapper.toSprintDto(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public SprintDto addBpmnModelToSprint(Long sprintId, BpmnModelDto bpmnModelDto, Authentication connectedUser) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
        var model = bpmnModelMapper.toBpmnModel(bpmnModelDto);
        sprint.addBpmnModel(model);
        return sprintMapper.toSprintDto(sprintRepository.save(sprint));
    }

    @Override
    public BpmnModelDto getCurrentBpmnModelForSprint(Long sprintId, Authentication connectedUser) {
        return null;
    }

    private Sprint createAndSaveSprint(CreateSprintRequestDto request, Project project) {
        Sprint sprint = Sprint.builder()
                .name(request.name())
                .project(project)
                .status(request.status())
                .startDate(now().toString())
                .build();
        return sprintRepository.save(sprint);
    }

    private void createAndSaveInitialBpmnModel(String initialBpmnXml, Sprint sprint) {
        BpmnModel model = BpmnModel.builder()
                .name("First Version")
                .bpmnXml(initialBpmnXml)
                .createdAt(now())
                .sprint(sprint)
                .build();
        bpmnModelRepository.save(model);
    }
}
