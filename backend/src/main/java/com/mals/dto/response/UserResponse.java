package com.mals.dto.response;

import com.mals.entity.User;
import com.mals.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String rank;
    private String unit;
    private boolean enabled;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        return UserResponse.builder()
            .id(u.getId())
            .username(u.getUsername())
            .email(u.getEmail())
            .role(u.getRole())
            .rank(u.getRank())
            .unit(u.getUnit())
            .enabled(u.isEnabled())
            .createdAt(u.getCreatedAt())
            .build();
    }
}
