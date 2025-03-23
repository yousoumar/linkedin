package com.linkedin.backend.features.authentication.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.linkedin.backend.dto.Response;
import com.linkedin.backend.features.authentication.dto.AuthenticationOauthRequestBody;
import com.linkedin.backend.features.authentication.dto.AuthenticationRequestBody;
import com.linkedin.backend.features.authentication.dto.AuthenticationResponseBody;
import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.authentication.service.AuthenticationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/authentication")
public class AuthenticationController {
    private final AuthenticationService authenticationUserService;

    public AuthenticationController(AuthenticationService authenticationUserService) {
        this.authenticationUserService = authenticationUserService;
    }

    @PostMapping("/login")
    public AuthenticationResponseBody loginPage(@Valid @RequestBody AuthenticationRequestBody loginRequestBody) {
        return authenticationUserService.login(loginRequestBody);
    }

    @PostMapping("/oauth/google/login")
    public AuthenticationResponseBody googleLogin(@RequestBody AuthenticationOauthRequestBody oauth2RequestBody) {
        return authenticationUserService.googleLoginOrSignup(oauth2RequestBody.code(), oauth2RequestBody.page());
    }

    @PostMapping("/register")
    public AuthenticationResponseBody registerPage(@Valid @RequestBody AuthenticationRequestBody registerRequestBody) {
        return authenticationUserService.register(registerRequestBody);
    }

    @DeleteMapping("/delete")
    public Response deleteUser(@RequestAttribute("authenticatedUser") User user) {
        authenticationUserService.deleteUser(user.getId());
        return new Response("User deleted successfully.");
    }

    @PutMapping("/validate-email-verification-token")
    public Response verifyEmail(@RequestParam String token, @RequestAttribute("authenticatedUser") User user) {
        authenticationUserService.validateEmailVerificationToken(token, user.getEmail());
        return new Response("Email verified successfully.");
    }

    @GetMapping("/send-email-verification-token")
    public Response sendEmailVerificationToken(@RequestAttribute("authenticatedUser") User user) {
        authenticationUserService.sendEmailVerificationToken(user.getEmail());
        return new Response("Email verification token sent successfully.");
    }

    @PutMapping("/send-password-reset-token")
    public Response sendPasswordResetToken(@RequestParam String email) {
        authenticationUserService.sendPasswordResetToken(email);
        return new Response("Password reset token sent successfully.");
    }

    @PutMapping("/reset-password")
    public Response resetPassword(@RequestParam String newPassword, @RequestParam String token,
            @RequestParam String email) {
        authenticationUserService.resetPassword(email, newPassword, token);
        return new Response("Password reset successfully.");
    }

    @PutMapping("/profile/{id}/info")
    public User updateUserProfile(
            @RequestAttribute("authenticatedUser") User user,
            @PathVariable Long id,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String about) {

        if (!user.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have permission to update this profile.");
        }

        return authenticationUserService.updateUserProfile(
                user,
                firstName, lastName, company, position, location, about);
    }

    @PutMapping("/profile/{id}/profile-picture")
    public User updateProfilePicture(
            @RequestAttribute("authenticatedUser") User user,
            @PathVariable Long id,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) throws IOException {

        if (!user.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have permission to update this profile picture.");
        }

        return authenticationUserService.updateProfilePicture(user, profilePicture);
    }

    @PutMapping("/profile/{id}/cover-picture")
    public User updateCoverPicture(
            @RequestAttribute("authenticatedUser") User user,
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile coverPicture) throws IOException {

        if (!user.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have permission to update this cover picture.");
        }

        return authenticationUserService.updateCoverPicture(user, coverPicture);
    }

    @GetMapping("/users/me")
    public User getUser(@RequestAttribute("authenticatedUser") User user) {
        return user;
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return authenticationUserService.getUserById(id);
    }
}