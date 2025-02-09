package com.linkedin.backend.features.networking.service;

import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.authentication.repository.UserRepository;
import com.linkedin.backend.features.networking.model.Connection;
import com.linkedin.backend.features.networking.model.Status;
import com.linkedin.backend.features.networking.repository.ConnectionRepository;
import com.linkedin.backend.features.notifications.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository, NotificationService notificationService) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Connection sendConnectionRequest(User sender, Long recipientId) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        if (connectionRepository.existsByAuthorAndRecipient(sender, recipient) ||
                connectionRepository.existsByAuthorAndRecipient(recipient, sender)) {
            throw new IllegalStateException("Connection request already exists");
        }

        Connection connection = connectionRepository.save(new Connection(sender, recipient));
        notificationService.sendNewInvitationToUsers(sender.getId(), recipient.getId(), connection);
        return connection;
    }

    public Connection acceptConnectionRequest(User recipient, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(recipient.getId())) {
            throw new IllegalStateException("User is not the recipient of the connection request");
        }

        if (connection.getStatus().equals(Status.ACCEPTED)) {
            throw new IllegalStateException("Connection is already accepted");
        }

        connection.setStatus(Status.ACCEPTED);
        notificationService.sendInvitationAcceptedToUsers(connection.getAuthor().getId(), connection.getRecipient().getId(), connection);
        return connectionRepository.save(connection);
    }

    public Connection rejectOrCancelConnection(User recipient, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(recipient.getId()) && !connection.getAuthor().getId().equals(recipient.getId())) {
            throw new IllegalStateException("User is not the recipient or author of the connection request");
        }
        connectionRepository.deleteById(connectionId);
        notificationService.sendRemoveConnectionToUsers(connection.getAuthor().getId(), connection.getRecipient().getId(), connection);
        return connection;
    }

    public List<Connection> getUserConnections(User user, Status status) {
        return connectionRepository.findConnectionsByUserAndStatus(user, status != null ? status : Status.ACCEPTED);
    }

    public List<Connection> getUserConnections(Long userId, Status status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return connectionRepository.findConnectionsByUserAndStatus(user, status != null ? status : Status.ACCEPTED);
    }

    public Connection markConnectionAsSeen(User user, Long id) {
        Connection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(user.getId())) {
            throw new IllegalStateException("User is not the recipient of the connection request");
        }

        connection.setSeen(true);
        notificationService.sendConnectionSeenNotification(connection.getRecipient().getId(), connection);
        return connectionRepository.save(connection);
    }


    public List<User> getRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<User> secondDegreeConnections = getSecondDegreeConnections(user);

        secondDegreeConnections = secondDegreeConnections.isEmpty() ? new HashSet<>(userRepository.findAllByIdNot(userId)) : secondDegreeConnections;

        List<UserRecommendation> recommendations = new ArrayList<>();

        for (User potentialConnection : secondDegreeConnections) {
            if (!potentialConnection.getProfileComplete()) {
                continue;
            }

            double score = calculateProfileSimilarity(user, potentialConnection);

            int mutualConnections = countMutualConnections(user, potentialConnection);
            score += mutualConnections * 0.5;

            recommendations.add(new UserRecommendation(potentialConnection, score));
        }

        return recommendations.stream()
                .sorted((r1, r2) -> Double.compare(r2.score(), r1.score()))
                .limit(limit)
                .map(UserRecommendation::user)
                .collect(Collectors.toList());
    }

    private double calculateProfileSimilarity(User user1, User user2) {
        double score = 0.0;

        if (user1.getCompany().equalsIgnoreCase(user2.getCompany())) {
            score += 3.0;
        }
        if (user1.getPosition().equalsIgnoreCase(user2.getPosition())) {
            score += 2.0;
        }

        if (user1.getLocation().equalsIgnoreCase(user2.getLocation())) {
            score += 1.5;
        }

        return score;
    }

    private Set<User> getSecondDegreeConnections(User user) {
        Set<User> directConnections = new HashSet<>();

        user.getInitiatedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> directConnections.add(conn.getRecipient()));

        user.getReceivedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> directConnections.add(conn.getAuthor()));

        Set<User> secondDegreeConnections = new HashSet<>();

        for (User directConnection : directConnections) {
            directConnection.getInitiatedConnections().stream()
                    .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                    .forEach(conn -> secondDegreeConnections.add(conn.getRecipient()));

            directConnection.getReceivedConnections().stream()
                    .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                    .forEach(conn -> secondDegreeConnections.add(conn.getAuthor()));
        }

        secondDegreeConnections.remove(user);
        secondDegreeConnections.removeAll(directConnections);

        return secondDegreeConnections;
    }
    
    private int countMutualConnections(User user1, User user2) {
        Set<User> user1Connections = new HashSet<>();

        user1.getInitiatedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> user1Connections.add(conn.getRecipient()));
        user1.getReceivedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> user1Connections.add(conn.getAuthor()));

        Set<User> user2Connections = new HashSet<>();
        user2.getInitiatedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> user2Connections.add(conn.getRecipient()));
        user2.getReceivedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> user2Connections.add(conn.getAuthor()));

        user1Connections.retainAll(user2Connections);
        return user1Connections.size();
    }

    private record UserRecommendation(User user, double score) {
    }


}
