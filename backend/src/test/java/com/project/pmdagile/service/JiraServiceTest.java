package com.project.pmdagile.service;

import com.project.pmdagile.service.implementation.JiraService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.web.client.RestClient;

class JiraServiceTest {

    @Mock
    private JiraIdentificationProvider jiraIdentificationProviderMock;

    @Mock
    private RestClient jiraApiClientMock;

    @InjectMocks
    private JiraService underTest;

    @Test
    public void test() {

    }

}