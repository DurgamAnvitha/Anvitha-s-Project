package com.smartclass.dashboard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        String subject = "Your OTP for Avanthi Institute Password Reset";
        String text = "Your OTP is: " + otp + "\nThis OTP is valid for 10 minutes.";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
                System.out.println("OTP for " + to + " is: " + otp + " (Email sending failed)");
            }
        } else {
            System.out.println("Email sender not configured. OTP for " + to + " is: " + otp);
        }
    }
}
