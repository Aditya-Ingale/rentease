package com.rentease.backend.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final Resend resend;
    private final String fromEmail;
    private final String fromName;

    public EmailService(
            @Value("${resend.api.key}") String apiKey,
            @Value("${resend.from.email:onboarding@resend.dev}") String fromEmail,
            @Value("${resend.from.name:RentEase}") String fromName) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromName + " <" + fromEmail + ">")
                    .to(to)
                    .subject(subject)
                    .text(body)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Email sent via Resend: id={} to={}", response.getId(), to);
        } catch (ResendException e) {
            log.error("Resend email failed to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again.");
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
                            "You can now:\n" +
                            "- Search properties across Indian cities\n" +
                            "- Get AI-powered fair rent estimates\n" +
                            "- Book properties directly\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Welcome email failed: {}", e.getMessage());
            // Non-fatal — don't throw
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
            // Non-fatal — booking still works
        }
    }

    public void sendPasswordResetEmail(String toEmail,
                                       String name,
                                       String resetToken) {
        sendEmail(
                toEmail,
                "RentEase — Password Reset Request",
                "Hello " + name + ",\n\n" +
                        "We received a request to reset your RentEase password.\n\n" +
                        "Click the link below to reset your password:\n\n" +
                        "http://localhost:3000/reset-password?token=" + resetToken + "\n\n" +
                        "Or copy this token manually if the link doesn't work:\n" +
                        resetToken + "\n\n" +
                        "This link expires in 15 minutes.\n\n" +
                        "If you did not request a password reset, ignore this email.\n\n" +
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
                            "Your payment has been confirmed successfully!\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Amount Paid: ₹" + String.format("%.2f", amount) + "\n\n" +
                            "Your booking is now COMPLETED.\n" +
                            "You can now write a review after your stay.\n\n" +
                            "Thank you for using RentEase!\n\n" +
                            "Regards,\nThe RentEase Team"
            );
        } catch (Exception e) {
            log.error("Payment confirmation email failed: {}", e.getMessage());
            // Non-fatal
        }
    }
}