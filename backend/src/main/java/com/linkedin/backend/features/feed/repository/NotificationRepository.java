package com.linkedin.backend.features.feed.repository;

import com.linkedin.backend.features.feed.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
