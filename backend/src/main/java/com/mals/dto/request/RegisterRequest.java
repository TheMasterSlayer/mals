package com.mals.dto.request;

import com.mals.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private Role role;

    @Size(max = 30, message = "Rank must not exceed 30 characters")
    private String rank;

    @Size(max = 100, message = "Unit must not exceed 100 characters")
    private String unit;
}
