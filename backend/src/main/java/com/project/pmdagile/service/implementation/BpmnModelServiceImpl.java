package com.project.pmdagile.service.implementation;

import com.project.pmdagile.auth.email.EmailService;
import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.auth.user.UserRepository;
import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.mapper.BpmnModelMapper;
import com.project.pmdagile.model.BpmnModel;
import com.project.pmdagile.model.Sprint;
import com.project.pmdagile.repository.BpmnModelRepository;
import com.project.pmdagile.repository.SprintRepository;
import com.project.pmdagile.service.IBpmnModelService;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class BpmnModelServiceImpl implements IBpmnModelService {

    private final BpmnModelRepository bpmnModelRepository;
    private final BpmnModelMapper bpmnModelMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SprintRepository sprintRepository;

    @Override
    @Transactional
    public List<BpmnModelDto> getBpmnModels(Authentication connectedUser) {
        String email = connectedUser.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return Stream.concat(user.getOwnedProjects().stream(), user.getSharedProjects().stream())
                .distinct()
                .flatMap(project -> project.getSprints().stream())
                .flatMap(sprint -> sprint.getBpmnModels().stream())
                .sorted(Comparator.comparing(BpmnModel::getId))
                .map(bpmnModelMapper::toBpmnModelDto)
                .toList();
    }

    @Override
    @Transactional
    public BpmnModelDto getBpmnModelById(Long id) {
        return bpmnModelRepository.findById(id)
                .map(bpmnModelMapper::toBpmnModelDto)
                .orElseThrow(() -> new EntityNotFoundException("Model not found"));
    }

    // todo: extra CreateBpmnModelRequestDto class to validate request
    @Override
    @Transactional
    public Long createBpmnModel(BpmnModelDto bpmnModelDto, Authentication connectedUser) {
        BpmnModel bpmnModel = bpmnModelMapper.toBpmnModel(bpmnModelDto);

        if (bpmnModelDto.sprintId() != null) {
            Sprint sprint = sprintRepository.findById(bpmnModelDto.sprintId())
                    .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));
            bpmnModel.setSprint(sprint);
        }

        bpmnModel.setCreatedAt(LocalDateTime.now());
        return bpmnModelRepository.save(bpmnModel).getId();
    }

    @Override
    @Transactional
    public BpmnModelDto updateBpmnModel(Long id, BpmnModelDto updatedBpmnModelDto) {
        BpmnModel model = bpmnModelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User trying to update BPMN model with id {} not found", id);
                    return new EntityNotFoundException("BPMN model not found");
                });
        model.setName(updatedBpmnModelDto.name());
        model.setBpmnXml(updatedBpmnModelDto.bpmnXml());
        return bpmnModelMapper.toBpmnModelDto(bpmnModelRepository.save(model));
    }

    @Override
    @Transactional
    public void deleteBpmnModel(Long id) {
        bpmnModelRepository.findById(id).ifPresentOrElse(model -> bpmnModelRepository.deleteById(model.getId()),
                () -> log.warn("User trying to delete BPMN model with id {} not found", id));
    }

    @Override
    public Long shareBpmnModelWithUser(Long modelId, String userEmail, Authentication connectedUser) throws MessagingException {
        User owner = userRepository.findByEmail(connectedUser.getName())
                .orElseThrow(() -> new EntityNotFoundException("Owner user not found"));
        BpmnModel bpmnModel = bpmnModelRepository.findById(modelId)
                .orElseThrow(() -> new EntityNotFoundException("BPMN model not found"));
        if (bpmnModel.getSprint() == null || bpmnModel.getSprint().getProject() == null) {
            throw new EntityNotFoundException("Project not found for BPMN model");
        }
        var project = bpmnModel.getSprint().getProject();

        if (!project.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("User is not the owner of the model");
        }

        emailService.sendShareModelWithEmail(userEmail, owner.getFirstname(), bpmnModel.getName());

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        project.shareWith(user);
        return bpmnModelRepository.save(bpmnModel).getId();
    }

    @Override
    @Transactional
    public List<BpmnModelDto> getBpmnModelsBySprintId(Long sprintId, Authentication connectedUser) {
        return bpmnModelRepository.findAllBySprintIdOrderByIdAsc(sprintId).stream()
                .map(bpmnModelMapper::toBpmnModelDto)
                .toList();
    }

    @Override
    @Transactional
    public Long createBpmnModelWithSprintId(BpmnModelDto bpmnModelDto, Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found"));

        BpmnModel bpmnModel = bpmnModelMapper.toBpmnModel(bpmnModelDto);
        bpmnModel.setSprint(sprint);
        bpmnModel.setCreatedAt(LocalDateTime.now());

        BpmnModel savedModel = bpmnModelRepository.save(bpmnModel);
        log.info("Created BPMN model '{}' linked to sprint '{}'", savedModel.getName(), sprint.getName());
        return savedModel.getId();
    }
}
