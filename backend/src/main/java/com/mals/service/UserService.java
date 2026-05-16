package com.mals.service;

import com.mals.dto.response.UserResponse;
import com.mals.exception.ResourceNotFoundException;
import com.mals.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public Page<UserResponse> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    public UserResponse findById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Transactional
    public void toggleEnabled(Long id, boolean enabled) {
        var user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setEnabled(enabled);
        userRepository.save(user);
    }
}
