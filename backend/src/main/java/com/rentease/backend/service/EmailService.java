package com.rentease.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final String frontendUrl;

    public EmailService(
            RestTemplate restTemplate,
            @Value("${brevo.api.key}") String apiKey,
            @Value("${brevo.from.email:noreply@rentease.com}") String fromEmail,
            @Value("${brevo.from.name:RentEase}") String fromName,
            @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.frontendUrl = frontendUrl;
    }

    private void sendEmail(String to, String toName,
                           String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> payload = Map.of(
                    "sender", Map.of(
                            "name", fromName,
                            "email", fromEmail
                    ),
                    "to", List.of(Map.of(
                            "email", to,
                            "name", toName
                    )),
                    "subject", subject,
                    "textContent", body
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    request,
                    Map.class
            );

            log.info("Email sent via Brevo: to={} subject={}",
                    to, subject);

        } catch (Exception e) {
            log.error("Brevo email failed to {}: {}", to, e.getMessage());
            throw new RuntimeException(
                    "Failed to send email. Please try again.");
        }
    }

    public void sendOtpEmail(String toEmail, String name, String otp) {
        sendEmail(
                toEmail, name,
                "RentEase — Your OTP Verification Code",
                "Hello " + name + ",\n\n" +
                        "Welcome to RentEase!\n\n" +
                        "Your OTP verification code is:\n\n" +
                        "        " + otp + "\n\n" +
                        "This code is valid for 10 minutes.\n" +
                        "Do not share this code with anyone.\n\n" +
                        "If you did not register on RentEase, " +
                        "please ignore this email.\n\n" +
                        "Regards,\nThe RentEase Team"
        );
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            sendEmail(
                    toEmail, name,
                    "Welcome to RentEase!",
                    "Hello " + name + ",\n\n" +
                            "Your account has been verified successfully!\n\n" +
                            "You can now:\n" +
                            "- Search properties across Indian cities\n" +
                            "- Get AI-powered fair rent estimates\n" +
                            "- Book properties directly\n\n" +
                            "Start exploring: " + frontendUrl + "\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Welcome email failed: {}", e.getMessage());
        }
    }

    public void sendBookingNotification(String toEmail, String toName,
                                        String otherPartyName,
                                        String propertyTitle,
                                        String subject) {
        try {
            sendEmail(
                    toEmail, toName,
                    "RentEase — " + subject,
                    "Hello " + toName + ",\n\n" +
                            subject + "\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Related to: " + otherPartyName + "\n\n" +
                            "Log in to RentEase to view full details: " +
                            frontendUrl + "\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Booking notification failed: {}", e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail,
                                       String name,
                                       String resetToken) {
        sendEmail(
                toEmail, name,
                "RentEase — Password Reset Request",
                "Hello " + name + ",\n\n" +
                        "We received a request to reset your RentEase password.\n\n" +
                        "Click the link below to reset your password:\n\n" +
                        frontendUrl + "/reset-password?token=" + resetToken + "\n\n" +
                        "Or copy this token manually:\n" + resetToken + "\n\n" +
                        "This link expires in 15 minutes.\n\n" +
                        "If you did not request this, ignore this email.\n\n" +
                        "Regards,\nThe RentEase Team"
        );
    }

    public void sendPaymentConfirmation(String toEmail,
                                        String name,
                                        String propertyTitle,
                                        Double amount) {
        try {
            sendEmail(
                    toEmail, name,
                    "RentEase — Payment Confirmed!",
                    "Hello " + name + ",\n\n" +
                            "Your payment has been confirmed successfully!\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Amount Paid: ₹" + String.format("%.2f", amount) + "\n\n" +
                            "Your booking is now COMPLETED.\n" +
                            "You can now write a review after your stay.\n\n" +
                            "Thank you for using RentEase!\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Payment confirmation failed: {}", e.getMessage());
        }
    }
}