package com.linkedin.backend.features.search.configuration;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class SearchConfiguration {

    private static final String LUCENE_INDEX_DIR = "./lucene/indexes";
    private static final Logger log = LoggerFactory.getLogger(SearchConfiguration.class);

    @PreDestroy
    public void cleanUp() {
        try {
            Path directory = Paths.get(LUCENE_INDEX_DIR);
            if (Files.exists(directory)) {
                deleteDirectoryRecursively(directory);
                log.info("Lucene index directory cleared successfully.");
            }
        } catch (IOException e) {
            log.error("Error while clearing Lucene index directory: {}", e.getMessage());
        }
    }

    private void deleteDirectoryRecursively(Path path) throws IOException {
        Files.walk(path)
                .sorted((path1, path2) -> path2.compareTo(path1)) // Sort in reverse order to delete files before directories
                .map(Path::toFile)
                .forEach(File::delete);
    }
}
