package org.vasudha.portal.web;

import jakarta.validation.Valid;
import org.vasudha.portal.security.AppUserDetails;
import org.vasudha.portal.security.JwtService;
import org.vasudha.portal.web.dto.LoginRequest;
import org.vasudha.portal.web.dto.LoginResponse;
import org.vasudha.portal.web.error.ApiException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));

            AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
            String role = principal.getUser().getRole().name();
            String token = jwtService.generateToken(principal.getUsername(), role);

            return ResponseEntity.ok(new LoginResponse(token, principal.getUsername(), role));
        } catch (DisabledException ex) {
            throw new ApiException(423, "This account has been disabled.");
        } catch (BadCredentialsException ex) {
            throw new ApiException(401, "Invalid email or password.");
        }
    }
}
