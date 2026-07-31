package com.project.pmdagile.auth.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;

import static com.project.pmdagile.auth.email.EmailTemplateName.*;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${application.mailing.from}")
    private String fromEmail;

    @Async
    public void sendAccountActivationEmail(
            String to,
            String username,
            String confirmationUrl,
            String activationCode,
            String subject) throws MessagingException {
        String templateName = ACTIVATE_ACCOUNT.name();
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MULTIPART_MODE_MIXED,
                UTF_8.name()
        );
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);
        properties.put("activation_code", activationCode);

        sendEmail(to, subject, templateName, mimeMessage, helper, properties);
    }

    @Async
    public void sendPasswordResetEmail(
            String to,
            String resetPasswordUrl,
            String resetCode,
            String subject) throws MessagingException {
        String templateName = RESET_PASSWORD.getName();
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("resetPasswordUrl", resetPasswordUrl);
        properties.put("reset_code", resetCode);

        sendEmail(to, subject, templateName, mimeMessage, helper, properties);
    }

    @Async
    public void sendShareModelWithEmail(String to, String username, String modelName) throws MessagingException {
        String templateName = SHARE_MODEL.getName();
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("modelName", modelName);

        sendEmail(to, username + " shared a model with you.", templateName, mimeMessage, helper, properties);
    }

    private void sendEmail(String to,
                           String subject,
                           String templateName,
                           MimeMessage mimeMessage,
                           MimeMessageHelper helper,
                           Map<String, Object> properties) throws MessagingException {
        Context context = new Context();
        context.setVariables(properties);

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);

        String template = templateEngine.process(templateName, context);
        helper.setText(template, true);

        mailSender.send(mimeMessage);
    }
}
