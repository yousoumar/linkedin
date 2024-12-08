package com.linkedin.backend.features.notifications.service;

import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import com.linkedin.backend.features.feed.model.Comment;
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

    public List<Notification> getUserNotifications(AuthenticationUser user) {
        return notificationRepository.findByRecipientOrderByCreationDateDesc(user);
    }

    public void sendLikeToPost(Long postId, Set<AuthenticationUser> likes) {
        messagingTemplate.convertAndSend("/topic/likes/" + postId, likes);
    }

    public void sendCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId, comment);
    }

    public void sendDeleteCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId + "/delete", comment);
    }

    public void sendCommentNotification(AuthenticationUser author, AuthenticationUser recipient, Long resourceId) {
        if (author.getId().equals(recipient.getId())) {
            return;
        }

        Notification notification = new Notification(
                author,
                recipient,
                NotificationType.COMMENT,
                resourceId
        );
        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/users/" + recipient.getId() + "/notifications", notification);
    }


    public void sendLikeNotification(AuthenticationUser author, AuthenticationUser recipient, Long resourceId) {
        if (author.getId().equals(recipient.getId())) {
            return;
        }

        Notification notification = new Notification(
                author,
                recipient,
                NotificationType.LIKE,
                resourceId
        );
        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/users/" + recipient.getId() + "/notifications", notification);
    }

    public Notification markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        messagingTemplate.convertAndSend("/topic/users/" + notification.getRecipient().getId() + "/notifications", notification);
        return notificationRepository.save(notification);
    }
}
