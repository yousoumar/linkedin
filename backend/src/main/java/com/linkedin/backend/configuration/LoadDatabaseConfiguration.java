package com.linkedin.backend.configuration;

import com.linkedin.backend.features.authentication.model.User;
import com.linkedin.backend.features.authentication.repository.UserRepository;
import com.linkedin.backend.features.authentication.utils.Encoder;
import com.linkedin.backend.features.feed.model.Post;
import com.linkedin.backend.features.feed.repository.PostRepository;
import com.linkedin.backend.features.networking.model.Connection;
import com.linkedin.backend.features.networking.model.Status;
import com.linkedin.backend.features.networking.repository.ConnectionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.List;
import java.util.Random;

@Configuration
public class LoadDatabaseConfiguration {
    private final Encoder encoder;

    public LoadDatabaseConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PostRepository postRepository, ConnectionRepository connectionRepository) {
        return args -> {
            List<User> users = createUsers(userRepository);
            createConnections(connectionRepository, users);
            createPosts(postRepository, users);
        };
    }

    private List<User> createUsers(UserRepository userRepository) {
        List<User> users = List.of(
                createUser("john.doe@example.com", "john", "John", "Doe", "Software Engineer", "Docker Inc",
                        "San Francisco, CA",
                        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
                createUser("anne.claire@example.com", "anne", "Anne", "Claire", "HR Manager", "eToro", "Paris, Fr",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
                createUser("arnauld.manner@example.com", "arnauld", "Arnauld", "Manner", "Product Manager", "Arc",
                        "Dakar, SN",
                        "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?q=80&w=2725&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
                createUser("moussa.diop@example.com", "moussa", "Moussa", "Diop", "Software Engineer", "Orange",
                        "Bordeaux, FR",
                        "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
                createUser("awa.diop@example.com", "awa", "Awa", "Diop", "Data Scientist", "Zoho", "New Delhi, IN",
                        "https://images.unsplash.com/photo-1640951613773-54706e06851d?q=80&w=2967&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"));

        userRepository.saveAll(users);
        return users;
    }

    private User createUser(String email, String password, String firstName, String lastName,
                            String position, String company, String location, String profilePicture) {
        User user = new User(email, encoder.encode(password));
        user.setEmailVerified(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPosition(position);
        user.setCompany(company);
        user.setLocation(location);
        user.setProfilePicture(profilePicture);
        user.setAbout("I'm a passionate professional with a strong background in " + position + " at " + company + ".");
        return user;
    }

    private void createConnections(ConnectionRepository connectionRepository, List<User> users) {
        Random random = new Random();
        for (int i = 0; i < users.size(); i++) {
            User author = users.get(random.nextInt(users.size()));
            User recipient;
            do {
                recipient = users.get(random.nextInt(users.size()));
            } while (author.equals(recipient));

            Connection connection = new Connection(author, recipient);
            connection.setStatus(Status.ACCEPTED);
            connectionRepository.save(connection);
        }
    }

    private void createPosts(PostRepository postRepository, List<User> users) {
        Random random = new Random();
        String[] postContents = {
                "Exploring the latest in AI technology!",
                "Team building event was a huge success.",
                "Sharing insights from my latest project.",
                "Reflecting on the importance of work-life balance.",
                "Here's a book recommendation for all leaders.",
                "Attended an amazing workshop on cloud computing.",
                "Excited to announce a new role at an incredible company.",
                "Key takeaways from the industry conference this week.",
                "Here's how to effectively lead remote teams.",
                "Grateful for the opportunities to learn and grow this year."
        };

        for (int j = 1; j <= 20; j++) {
            String content = postContents[random.nextInt(postContents.length)];
            User author = users.get(random.nextInt(users.size()));
            Post post = new Post(content, author);
            post.setLikes(generateLikes(users, random));
            if (j == 2) {
                post.setPicture("https://images.unsplash.com/photo-1731176497854-f9ea4dd52eb6?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
            }
            postRepository.save(post);
        }
    }

    private HashSet<User> generateLikes(List<User> users, Random random) {
        HashSet<User> likes = new HashSet<>();
        int likesCount = random.nextInt(users.size()) / 2;

        while (likes.size() < likesCount) {
            likes.add(users.get(random.nextInt(users.size())));
        }

        return likes;
    }
}
