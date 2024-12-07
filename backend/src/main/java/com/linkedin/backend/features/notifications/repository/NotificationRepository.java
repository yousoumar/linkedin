package com.linkedin.backend.features.notifications.repository;

import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import com.linkedin.backend.features.notifications.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient(AuthenticationUser recipient);
    List<Notification> findByRecipientOrderByCreationDateDesc(AuthenticationUser user);
}
