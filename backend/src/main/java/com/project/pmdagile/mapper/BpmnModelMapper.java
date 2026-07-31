package com.project.pmdagile.mapper;

import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.model.BpmnModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BpmnModelMapper {

    public BpmnModel toBpmnModel(BpmnModelDto bpmnModelDto) {
        return BpmnModel.builder()
                .id(bpmnModelDto.id())
                .name(bpmnModelDto.name())
                .bpmnXml(bpmnModelDto.bpmnXml())
                .build();
    }

    public BpmnModelDto toBpmnModelDto(BpmnModel bpmnModel) {
        return new BpmnModelDto(
                bpmnModel.getId(),
                bpmnModel.getSprint().getId(),
                bpmnModel.getName(),
                bpmnModel.getBpmnXml()
        );
    }
}
