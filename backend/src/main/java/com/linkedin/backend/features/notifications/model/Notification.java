package com.linkedin.backend.features.notifications.model;

import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import jakarta.persistence.*;


@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private AuthenticationUser recipient;
    @ManyToOne
    private AuthenticationUser actor;
    private boolean isRead;
    private NotificationType type;

    public Notification(AuthenticationUser actor, AuthenticationUser recipient, NotificationType type) {
        this.actor = actor;
        this.recipient = recipient;
        this.type = type;
        this.isRead = false;
    }

    public Notification() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public AuthenticationUser getRecipient() {
        return recipient;
    }

    public void setRecipient(AuthenticationUser recipient) {
        this.recipient = recipient;
    }

    public AuthenticationUser getActor() {
        return actor;
    }

    public void setActor(AuthenticationUser actor) {
        this.actor = actor;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }
}
