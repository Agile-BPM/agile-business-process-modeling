package com.project.pmdagile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.pmdagile.AbstractIntegrationTest;
import com.project.pmdagile.config.TokenRefreshInterceptor;
import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.dto.bpmn.ProjectDto;
import com.project.pmdagile.dto.bpmn.SprintDto;
import com.project.pmdagile.service.IBpmnModelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.util.List;

import static com.project.pmdagile.JUnitTags.INTEGRATION_TEST;
import static java.time.LocalTime.now;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Tag(INTEGRATION_TEST)
@AutoConfigureMockMvc
class PmdAgileControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private TokenRefreshInterceptor tokenRefreshInterceptor;
    @MockitoBean
    private IBpmnModelService bpmnModelServiceMock;
    @Autowired
    private ObjectMapper objectMapper;

    ProjectDto projectDto;
    SprintDto sprintDto;

    BpmnModelDto bpmnModel1;
    BpmnModelDto bpmnModel2;

    @BeforeEach
    public void setUp() throws IOException {
        when(tokenRefreshInterceptor.preHandle(any(), any(), any())).thenReturn(true);

        projectDto = new ProjectDto(1L, "Project 1", null, null);
        sprintDto = new SprintDto(1L, projectDto.id(), "Sprint 1", "active", now().toString(), null);

        bpmnModel1 = new BpmnModelDto(1L, sprintDto.id(), "model1", "someBpmnString1");
        bpmnModel2 = new BpmnModelDto(2L, sprintDto.id(), "model2", "someBpmnString2");
    }

    @Test
    public void getModelsTest() throws Exception {
        when(bpmnModelServiceMock.getBpmnModels(any(Authentication.class))).thenReturn(List.of(bpmnModel1, bpmnModel2));

        mockMvc.perform(get("/pmd-agile/models")
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].id").value(bpmnModel1.id()))
                .andExpect(jsonPath("$[0].name").value(bpmnModel1.name()))
                .andExpect(jsonPath("$[0].bpmnXml").value(bpmnModel1.bpmnXml()))
                .andExpect(jsonPath("$[1].id").value(bpmnModel2.id()))
                .andExpect(jsonPath("$[1].name").value(bpmnModel2.name()))
                .andExpect(jsonPath("$[1].bpmnXml").value(bpmnModel2.bpmnXml()));
    }

    @Test
    public void getModelsWithoutAuthenticationTest() throws Exception {
        when(bpmnModelServiceMock.getBpmnModels(any(Authentication.class))).thenReturn(List.of(bpmnModel1, bpmnModel2));

        mockMvc.perform(get("/pmd-agile/models")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void saveModelTest() throws Exception {
        BpmnModelDto newModel = new BpmnModelDto(null, sprintDto.id(), "New Model", "<bpmn:definitions>New BPMN</bpmn:definitions>");
        Long savedModelId = 3L;
        when(bpmnModelServiceMock.createBpmnModel(any(BpmnModelDto.class), any(Authentication.class)))
                .thenReturn(savedModelId);

        mockMvc.perform(post("/pmd-agile/models")
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newModel)))
                .andExpect(status().isOk())
                .andExpect(content().string(savedModelId.toString()));
    }

    @Test
    public void saveModelWithoutAuthenticationTest() throws Exception {
        BpmnModelDto newModel = new BpmnModelDto(null, sprintDto.id(), "New Model", "<bpmn:definitions>New BPMN</bpmn:definitions>");

        mockMvc.perform(post("/pmd-agile/models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newModel)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void saveModelWithInvalidDataTest() throws Exception {
        String invalidJson = "{ \"invalid\": \"json\" }";

        mockMvc.perform(post("/pmd-agile/models")
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isOk()); // Controller doesn't validate, service layer should handle validation
    }

    @Test
    public void saveModelServiceExceptionTest() throws Exception {
        BpmnModelDto newModel = new BpmnModelDto(null, sprintDto.id(), "New Model", "<bpmn:definitions>New BPMN</bpmn:definitions>");
        when(bpmnModelServiceMock.createBpmnModel(any(BpmnModelDto.class), any(Authentication.class)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/pmd-agile/models")
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void updateModelTest() throws Exception {
        Long modelId = 1L;
        BpmnModelDto updatedModel = new BpmnModelDto(modelId, sprintDto.id(), "Updated Model", "<bpmn:definitions>Updated BPMN</bpmn:definitions>");
        when(bpmnModelServiceMock.updateBpmnModel(eq(modelId), any(BpmnModelDto.class)))
                .thenReturn(updatedModel);

        mockMvc.perform(put("/pmd-agile/models/{id}", modelId)
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(updatedModel.id()))
                .andExpect(jsonPath("$.name").value(updatedModel.name()))
                .andExpect(jsonPath("$.bpmnXml").value(updatedModel.bpmnXml()));
    }

    @Test
    public void updateModelWithoutAuthenticationTest() throws Exception {
        Long modelId = 1L;
        BpmnModelDto updatedModel = new BpmnModelDto(modelId, sprintDto.id(), "Updated Model", "<bpmn:definitions>Updated BPMN</bpmn:definitions>");

        mockMvc.perform(put("/pmd-agile/models/{id}", modelId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedModel)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void updateModelNotFoundTest() throws Exception {
        Long nonExistentId = 999L;
        BpmnModelDto updatedModel = new BpmnModelDto(nonExistentId, sprintDto.id(), "Updated Model", "<bpmn:definitions>Updated BPMN</bpmn:definitions>");

        when(bpmnModelServiceMock.updateBpmnModel(eq(nonExistentId), any(BpmnModelDto.class)))
                .thenThrow(new RuntimeException("Model not found"));

        mockMvc.perform(put("/pmd-agile/models/{id}", nonExistentId)
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void updateModelWithInvalidIdTest() throws Exception {
        String invalidId = "invalid";
        BpmnModelDto updatedModel = new BpmnModelDto(1L, sprintDto.id(), "Updated Model", "<bpmn:definitions>Updated BPMN</bpmn:definitions>");

        mockMvc.perform(put("/pmd-agile/models/{id}", invalidId)
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedModel)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateModelWithInvalidDataTest() throws Exception {
        Long modelId = 1L;
        String invalidJson = "{ \"invalid\": \"json\" }";

        mockMvc.perform(put("/pmd-agile/models/{id}", modelId)
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isOk());
    }

    @Test
    public void updateModelServiceExceptionTest() throws Exception {
        Long modelId = 1L;
        BpmnModelDto updatedModel = new BpmnModelDto(modelId, sprintDto.id(), "Updated Model", "<bpmn:definitions>Updated BPMN</bpmn:definitions>");
        when(bpmnModelServiceMock.updateBpmnModel(eq(modelId), any(BpmnModelDto.class)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(put("/pmd-agile/models/{id}", modelId)
                        .with(user("user"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedModel)))
                .andExpect(status().isInternalServerError());
    }
}
