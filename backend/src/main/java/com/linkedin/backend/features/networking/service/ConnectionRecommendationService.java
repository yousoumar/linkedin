package com.linkedin.backend.features.networking.service;

import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.authentication.repository.UserRepository;
import com.linkedin.backend.features.networking.model.Status;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ConnectionRecommendationService {


    private final UserRepository userRepository;

    public ConnectionRecommendationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Calculate profile similarity between two users
     */
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

    /**
     * Get all second-degree connections for a user
     */
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

    /**
     * Count mutual connections between two users
     */
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

    /**
     * Get connection recommendations for a user
     */
    public List<User> getRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<User> secondDegreeConnections = getSecondDegreeConnections(user);

        List<UserRecommendation> recommendations = new ArrayList<>();

        for (User potentialConnection : secondDegreeConnections) {
            if (!potentialConnection.getProfileComplete()) {
                continue;
            }

            double score = calculateProfileSimilarity(user, potentialConnection);

            int mutualConnections = countMutualConnections(user, potentialConnection);
            //score += mutualConnections * 1.5;

            recommendations.add(new UserRecommendation(potentialConnection, score));
        }
        
        return recommendations.stream()
                .sorted((r1, r2) -> Double.compare(r2.score(), r1.score()))
                .limit(limit)
                .map(UserRecommendation::user)
                .collect(Collectors.toList());
    }

    /**
     * Represents a recommendation with its score
     */
    public record UserRecommendation(User user, double score) {
    }
}