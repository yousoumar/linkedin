package com.linkedin.backend.features.notifications.service;

import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.feed.model.Comment;
import com.linkedin.backend.features.feed.model.Post;
import com.linkedin.backend.features.messaging.model.Conversation;
import com.linkedin.backend.features.messaging.model.Message;
import com.linkedin.backend.features.networking.model.Connection;
import com.linkedin.backend.features.networking.model.Status;
import com.linkedin.backend.features.notifications.model.Notification;
import com.linkedin.backend.features.notifications.model.NotificationType;
import com.linkedin.backend.features.notifications.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreationDateDesc(user);
    }

    public void sendDeleteNotificationToPost(Long postId) {
        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/delete", postId);
    }

    public void sendEditNotificationToPost(Long postId, Post post) {
        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/edit", post);
    }

    public void sendNewPostNotificationToFeed(Post post) {
        for (Connection connection : post.getAuthor().getInitiatedConnections()) {
            if (connection.getStatus().equals(Status.ACCEPTED)) {
                messagingTemplate.convertAndSend("/topic/feed/" + connection.getRecipient().getId() + "/post", post);
            }
        }
        for (Connection connection : post.getAuthor().getReceivedConnections()) {
            if (connection.getStatus().equals(Status.ACCEPTED)) {
                messagingTemplate.convertAndSend("/topic/feed/" + connection.getAuthor().getId() + "/post", post);
            }
        }
    }

    public void sendLikeToPost(Long postId, Set<User> likes) {
        messagingTemplate.convertAndSend("/topic/likes/" + postId, likes);
    }

    public void sendCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId, comment);
    }

    public void sendDeleteCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId + "/delete", comment);
    }


    public void sendCommentNotification(User author, User recipient, Long resourceId) {
        if (author.getId().equals(recipient.getId())) {
            return;
        }

        Notification notification = new Notification(
                author,
                recipient,
                NotificationType.COMMENT,
                resourceId);
        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/users/" + recipient.getId() + "/notifications", notification);
    }

    public void sendLikeNotification(User author, User recipient, Long resourceId) {
        if (author.getId().equals(recipient.getId())) {
            return;
        }

        Notification notification = new Notification(
                author,
                recipient,
                NotificationType.LIKE,
                resourceId);
        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/users/" + recipient.getId() + "/notifications", notification);
    }

    public Notification markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        messagingTemplate.convertAndSend("/topic/users/" + notification.getRecipient().getId() + "/notifications",
                notification);
        return notificationRepository.save(notification);
    }

    public void sendConversationToUsers(Long senderId, Long receiverId, Conversation conversation) {
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/conversations", conversation);
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/conversations", conversation);
    }

    public void sendMessageToConversation(Long conversationId, Message message) {
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/messages", message);
    }

    public void sendNewInvitationToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/new", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/new", connection);
    }


    public void sendInvitationAcceptedToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/accepted", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/accepted", connection);
    }

    public void sendRemoveConnectionToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/remove", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/remove", connection);
    }

    public void sendConnectionSeenNotification(Long id, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + id + "/connections/seen", connection);
    }


}
