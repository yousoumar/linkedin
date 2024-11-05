package com.linkedin.backend.configuration;

import com.linkedin.backend.features.authentication.model.AuthenticationUser;
import com.linkedin.backend.features.authentication.repository.AuthenticationUserRepository;
import com.linkedin.backend.features.authentication.utils.Encoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoadDatabaseConfiguration {
    private final Encoder encoder;

    LoadDatabaseConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    @Bean
    public CommandLineRunner initDatabase(AuthenticationUserRepository authenticationUserRepository) {
        return args -> {
            AuthenticationUser user = new AuthenticationUser("user@example.com", encoder.encode("user"));
            authenticationUserRepository.save(user);
        };
    }
}
