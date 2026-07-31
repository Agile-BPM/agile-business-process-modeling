package com.project.pmdagile.auth.email;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    ACTIVATE_ACCOUNT("activate_account"),
    RESET_PASSWORD("reset_password"),
    SHARE_MODEL("share_model");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}
