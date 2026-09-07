package org.vasudha.portal.config;

import org.vasudha.portal.domain.Role;
import org.vasudha.portal.domain.User;
import org.vasudha.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public SuperAdminSeeder(UserRepository userRepository,
                             PasswordEncoder passwordEncoder,
                             @Value("${app.super-admin.email}") String email,
                             @Value("${app.super-admin.password}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.SUPER_ADMIN)) {
            return;
        }

        User superAdmin = new User(email, passwordEncoder.encode(password), Role.SUPER_ADMIN, null);
        userRepository.save(superAdmin);
        log.info("Seeded default Super Admin account: {}", email);
    }
}
