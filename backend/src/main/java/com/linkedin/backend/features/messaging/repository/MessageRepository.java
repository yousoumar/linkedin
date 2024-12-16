package com.linkedin.backend.features.messaging.repository;

import com.linkedin.backend.features.messaging.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MessageRepository extends JpaRepository<Message, Long> {
}