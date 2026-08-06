package com.rentease.backend.dto;

import com.rentease.backend.enums.Role;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String message;
}