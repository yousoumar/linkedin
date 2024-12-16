package com.linkedin.backend.features.messaging.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AuthenticationUser sender;

    @ManyToOne(optional = false)
    private AuthenticationUser receiver;

    @JsonIgnore
    @ManyToOne(optional = false)
    private Conversation conversation;

    private String content;
    private Boolean isRead;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Message() {
    }

    public Message(AuthenticationUser sender, AuthenticationUser receiver, Conversation conversation, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.conversation = conversation;
        this.content = content;
        this.isRead = false;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public AuthenticationUser getReceiver() {
        return receiver;
    }

    public void setReceiver(AuthenticationUser receiver) {
        this.receiver = receiver;
    }

    public AuthenticationUser getSender() {
        return sender;
    }

    public void setSender(AuthenticationUser sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }
}
