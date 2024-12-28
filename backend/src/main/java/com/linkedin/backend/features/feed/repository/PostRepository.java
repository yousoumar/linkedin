package com.linkedin.backend.features.feed.repository;

import com.linkedin.backend.features.feed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorId(Long authorId);

    List<Post> findAllByOrderByCreationDateDesc();
    
    List<Post> findByAuthorIdInOrderByCreationDateDesc(Set<Long> connectedUserIds);
}