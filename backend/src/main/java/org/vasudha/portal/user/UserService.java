package org.vasudha.portal.user;

import org.vasudha.portal.domain.Role;
import org.vasudha.portal.domain.User;
import org.vasudha.portal.repository.UserRepository;
import org.vasudha.portal.web.dto.AdminAccountDto;
import org.vasudha.portal.web.error.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminAccountDto createAdmin(String email, String password, UUID createdBy) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(409, "An account with this email already exists.");
        }

        User admin = new User(email.trim().toLowerCase(), passwordEncoder.encode(password), Role.ADMIN, createdBy);
        admin = userRepository.save(admin);
        return AdminAccountDto.from(admin);
    }

    public List<AdminAccountDto> listAdmins() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.ADMIN).stream()
                .map(AdminAccountDto::from)
                .toList();
    }

    @Transactional
    public AdminAccountDto setEnabled(UUID adminId, boolean enabled) {
        User admin = userRepository.findById(adminId)
                .filter(u -> u.getRole() == Role.ADMIN)
                .orElseThrow(() -> new ApiException(404, "Admin account not found."));
        admin.setEnabled(enabled);
        return AdminAccountDto.from(admin);
    }
}
