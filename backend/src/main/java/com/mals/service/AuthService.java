package com.mals.service;

import com.mals.dto.request.LoginRequest;
import com.mals.dto.request.RegisterRequest;
import com.mals.dto.response.AuthResponse;
import com.mals.entity.User;
import com.mals.enums.Role;
import com.mals.exception.ResourceNotFoundException;
import com.mals.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtService           jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService      auditLogService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + req.getUsername());
        }

        Role role = req.getRole() != null ? req.getRole() : Role.LOGISTICS_OFFICER;

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(role)
            .rank(req.getRank())
            .unit(req.getUnit())
            .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        auditLogService.log(user, "USER_REGISTERED", "User", user.getId(),
            "New user registered: " + user.getEmail(), null);

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user);

        auditLogService.log(user, "USER_LOGIN", "User", user.getId(),
            "User logged in", null);

        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .rank(user.getRank())
            .unit(user.getUnit())
            .build();
    }
}
