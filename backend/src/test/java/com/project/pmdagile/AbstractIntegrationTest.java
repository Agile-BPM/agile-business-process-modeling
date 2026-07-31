package com.project.pmdagile;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(locations = {"classpath:application-dev.properties", "classpath:application-test.properties"})
public class AbstractIntegrationTest {
}
