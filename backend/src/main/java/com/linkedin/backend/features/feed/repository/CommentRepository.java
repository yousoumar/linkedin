package com.linkedin.backend.features.feed.repository;

import com.linkedin.backend.features.feed.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}