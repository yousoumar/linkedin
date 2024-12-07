package com.linkedin.backend.features.notifications.controller;

import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import com.linkedin.backend.features.notifications.model.Notification;
import com.linkedin.backend.features.notifications.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationsController {
    private final NotificationService notificationService;

    public NotificationsController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getUserNotifications(@RequestAttribute("authenticatedUser") AuthenticationUser user) {
        return notificationService.getUserNotifications(user);
    }
}
