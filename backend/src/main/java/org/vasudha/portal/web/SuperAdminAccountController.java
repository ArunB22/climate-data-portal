package org.vasudha.portal.web;

import jakarta.validation.Valid;
import org.vasudha.portal.user.UserService;
import org.vasudha.portal.security.AppUserDetails;
import org.vasudha.portal.web.dto.AdminAccountDto;
import org.vasudha.portal.web.dto.CreateAdminRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/superadmin/admins")
public class SuperAdminAccountController {

    private final UserService userService;

    public SuperAdminAccountController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<AdminAccountDto> create(@AuthenticationPrincipal AppUserDetails principal,
                                                    @Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(userService.createAdmin(request.email(), request.password(), principal.getId()));
    }

    @GetMapping
    public List<AdminAccountDto> list() {
        return userService.listAdmins();
    }

    @PatchMapping("/{id}")
    public AdminAccountDto setEnabled(@PathVariable UUID id, @RequestParam boolean enabled) {
        return userService.setEnabled(id, enabled);
    }
}
