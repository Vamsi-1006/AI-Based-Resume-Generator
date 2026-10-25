package com.resume.backend.service;

import com.resume.backend.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/** In-memory store. Swap for a JPA repository / email sender in production. */
@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    public record ContactMessage(String id, Instant receivedAt, ContactRequest request) { }

    private final List<ContactMessage> messages = Collections.synchronizedList(new ArrayList<>());

    public ContactMessage save(ContactRequest req) {
        ContactMessage m = new ContactMessage(UUID.randomUUID().toString(), Instant.now(), req);
        messages.add(m);
        log.info("Contact message {} from {} <{}>: {}", m.id(), req.name(), req.email(), req.subject());
        return m;
    }

    public List<ContactMessage> all() {
        return List.copyOf(messages);
    }
}
