package org.vasudha.portal.repository;

import org.vasudha.portal.domain.Role;
import org.vasudha.portal.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByRole(Role role);

    List<User> findByRoleOrderByCreatedAtDesc(Role role);
}
