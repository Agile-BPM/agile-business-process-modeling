package com.project.pmdagile.mapper;

import com.project.pmdagile.dto.bpmn.SprintDto;
import com.project.pmdagile.model.Sprint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SprintMapper {

    private final ProjectMapper projectMapper;

    public Sprint toSprint(SprintDto sprintDto) {
        return Sprint.builder()
                .id(sprintDto.id())
                .name(sprintDto.name())
                .status(sprintDto.status())
                .startDate(sprintDto.startDate())
                .endDate(sprintDto.endDate())
                .build();
    }

    public SprintDto toSprintDto(Sprint sprint) {
        return new SprintDto(
                sprint.getId(),
                sprint.getProject().getId(),
                sprint.getName(),
                sprint.getStatus(),
                sprint.getStartDate(),
                sprint.getEndDate());
    }
}
