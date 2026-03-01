package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Query;
import com.smartclass.dashboard.repository.QueryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/queries")
public class QueryController {

    @Autowired
    private QueryRepository queryRepository;

    @GetMapping
    public List<Query> getAll() {
        return queryRepository.findAll();
    }

    @GetMapping("/sender/{senderId}")
    public List<Query> getBySender(@PathVariable String senderId) {
        return queryRepository.findBySenderId(senderId);
    }

    @GetMapping("/admin")
    public List<Query> getAdminQueries() {
        return queryRepository.findByReceiverId("ADMIN");
    }

    @PostMapping
    public Query create(@RequestBody Query query) {
        query.setCreatedAt(LocalDateTime.now());
        query.setStatus("PENDING");
        return queryRepository.save(query);
    }

    @PutMapping("/{id}/resolve")
    public Query resolve(@PathVariable String id, @RequestBody Query replyData) {
        Query q = queryRepository.findById(id).orElseThrow();
        q.setReply(replyData.getReply());
        q.setStatus("RESOLVED");
        q.setResolvedAt(LocalDateTime.now());
        return queryRepository.save(q);
    }
}
