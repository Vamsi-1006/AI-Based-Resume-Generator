package com.resume.backend.controller;

import com.resume.backend.dto.ContactRequest;
import com.resume.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody ContactRequest req) {
        var saved = contactService.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.id(),
                "message", "Thanks " + req.name() + "! We'll get back to you soon."));
    }
}
