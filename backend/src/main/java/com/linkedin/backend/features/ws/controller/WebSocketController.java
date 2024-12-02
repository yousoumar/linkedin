package com.linkedin.backend.features.ws.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private static final Logger log = LoggerFactory.getLogger(WebSocketController.class);

    @MessageMapping("/like")
    @SendTo("/topic/likes")
    public String sendLike(String message) {

        log.info("Received like: {}", message);
        return message;
    }

    @MessageMapping("/comment")
    @SendTo("/topic/comments")
    public String sendComment(String message) {
        log.info("Received comment: {}", message);
        return message;
    }

    @MessageMapping("/post")
    @SendTo("/topic/posts")
    public String sendPost(String message) {

        log.info("Received post: {}", message);
        return message;
    }
}