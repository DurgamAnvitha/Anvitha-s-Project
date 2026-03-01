package com.smartclass.dashboard.service;

import com.smartclass.dashboard.entity.User;
import com.smartclass.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public User signup(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        // In a real app, use BCryptPasswordEncoder
        return userRepository.save(user);
    }

    public User login(String identifier, String password) {
        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }
        return userOpt.filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
    }

    public void generateOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null && user.getOtp().equals(otp) && 
            user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            return true;
        }
        return false;
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (!verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email).get();
        user.setPassword(newPassword);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }
}
