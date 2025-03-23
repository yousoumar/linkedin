package com.linkedin.backend.features.feed.controller;

import com.linkedin.backend.dto.Response;
import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.feed.dto.CommentDto;
import com.linkedin.backend.features.feed.model.Comment;
import com.linkedin.backend.features.feed.model.Post;
import com.linkedin.backend.features.feed.service.FeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/feed")
public class FeedController {
    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping
    public ResponseEntity<List<Post>> getFeedPosts(@RequestAttribute("authenticatedUser") User user) {
        List<Post> posts = feedService.getFeedPosts(user.getId());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = feedService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestParam(value = "picture", required = false) MultipartFile picture,
                                           @RequestParam("content") String content,
                                           @RequestAttribute("authenticatedUser") User user) throws Exception {
        Post post = feedService.createPost(picture, content, user.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable Long postId) {
        Post post = feedService.getPost(postId);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<Post> editPost(@PathVariable Long postId, @RequestParam(value = "picture", required = false) MultipartFile picture,
                                         @RequestParam("content") String content,
                                         @RequestAttribute("authenticatedUser") User user) throws Exception {
        Post post = feedService.editPost(postId, user.getId(), picture, content);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Response> deletePost(@PathVariable Long postId,
                                               @RequestAttribute("authenticatedUser") User user) {
        feedService.deletePost(postId, user.getId());
        return ResponseEntity.ok(new Response("Post deleted successfully."));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto,
                                              @RequestAttribute("authenticatedUser") User user) {
        Comment comment = feedService.addComment(postId, user.getId(), commentDto.getContent());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        List<Comment> comments = feedService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Response> deleteComment(@PathVariable Long commentId,
                                                  @RequestAttribute("authenticatedUser") User user) {
        feedService.deleteComment(commentId, user.getId());
        return ResponseEntity.ok(new Response("Comment deleted successfully."));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> editComment(@PathVariable Long commentId, @RequestBody CommentDto commentDto,
                                               @RequestAttribute("authenticatedUser") User user) {
        Comment comment = feedService.editComment(commentId, user.getId(), commentDto.getContent());
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/posts/{postId}/like")
    public ResponseEntity<Post> likePost(@PathVariable Long postId, @RequestAttribute("authenticatedUser") User user) {
        Post post = feedService.likePost(postId, user.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/posts/{postId}/likes")
    public ResponseEntity<Set<User>> getPostLikes(@PathVariable Long postId) {
        Set<User> likes = feedService.getPostLikes(postId);
        return ResponseEntity.ok(likes);
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = feedService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }
}