package com.project.pmdagile.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ConfirmationResponse {
    private boolean successful;
}
