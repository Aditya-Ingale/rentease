package com.rentease.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public EmailService(
            RestTemplate restTemplate,
            @Value("${resend.api.key}") String apiKey,
            @Value("${resend.from.email:onboarding@resend.dev}") String fromEmail,
            @Value("${resend.from.name:RentEase}") String fromName) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> payload = Map.of(
                    "from", fromName + " <" + fromEmail + ">",
                    "to", new String[]{to},
                    "subject", subject,
                    "text", body
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    request,
                    Map.class
            );

            log.info("Email sent via Resend API: id={} to={}",
                    response.getBody().get("id"), to);

        } catch (Exception e) {
            log.error("Resend API failed to {}: {}", to, e.getMessage());
            throw new RuntimeException(
                    "Failed to send email. Please try again.");
        }
    }

    public void sendOtpEmail(String toEmail, String name, String otp) {
        sendEmail(
                toEmail,
                "RentEase — Your OTP Verification Code",
                "Hello " + name + ",\n\n" +
                        "Welcome to RentEase!\n\n" +
                        "Your OTP verification code is:\n\n" +
                        "        " + otp + "\n\n" +
                        "This code is valid for 10 minutes.\n" +
                        "Do not share this code with anyone.\n\n" +
                        "If you did not register on RentEase, please ignore this email.\n\n" +
                        "Regards,\nThe RentEase Team"
        );
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            sendEmail(
                    toEmail,
                    "Welcome to RentEase!",
                    "Hello " + name + ",\n\n" +
                            "Your account has been verified successfully!\n\n" +
                            "You can now search properties, get AI rent estimates, " +
                            "and book properties directly.\n\n" +
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
                    toEmail,
                    "RentEase — " + subject,
                    "Hello " + toName + ",\n\n" +
                            subject + "\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Related to: " + otherPartyName + "\n\n" +
                            "Log in to RentEase to view full details.\n\n" +
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
                toEmail,
                "RentEase — Password Reset Request",
                "Hello " + name + ",\n\n" +
                        "Click the link below to reset your password:\n\n" +
                        "https://rentease.vercel.app/reset-password?token="
                        + resetToken + "\n\n" +
                        "Or copy this token manually:\n" + resetToken + "\n\n" +
                        "This link expires in 15 minutes.\n\n" +
                        "Regards,\nThe RentEase Team"
        );
    }

    public void sendPaymentConfirmation(String toEmail,
                                        String name,
                                        String propertyTitle,
                                        Double amount) {
        try {
            sendEmail(
                    toEmail,
                    "RentEase — Payment Confirmed!",
                    "Hello " + name + ",\n\n" +
                            "Your payment has been confirmed!\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Amount Paid: ₹" + String.format("%.2f", amount) + "\n\n" +
                            "Your booking is now COMPLETED.\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Payment confirmation failed: {}", e.getMessage());
        }
    }
}