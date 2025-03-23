package com.linkedin.backend.features.storage.controller;

import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.linkedin.backend.features.storage.service.StorageService;

@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {
    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{filename}")
    public ResponseEntity<StreamingResponseBody> serveFile(@PathVariable String filename) throws IOException {
        MediaType mediaType = storageService.getMediaType(filename);
        FileInputStream resource = storageService.getFileInputStream(filename);

        StreamingResponseBody stream = outputStream -> {
            try (resource) {
                int nRead;
                byte[] data = new byte[1024];
                while ((nRead = resource.read(data, 0, data.length)) != -1) {
                    outputStream.write(data, 0, nRead);
                    outputStream.flush();
                }
            }
        };

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(stream);
    }
}