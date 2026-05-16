package com.mals.dto.response;

import com.mals.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private Role role;
    private String rank;
    private String unit;
}
