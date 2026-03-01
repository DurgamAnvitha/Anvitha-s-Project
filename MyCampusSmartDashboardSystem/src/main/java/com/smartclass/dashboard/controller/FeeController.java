package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Fee;
import com.smartclass.dashboard.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {
    
    @Autowired
    private FeeRepository feeRepo;

    @GetMapping
    public List<Fee> getAll() {
        return feeRepo.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Fee> getByStudent(@PathVariable String studentId) {
        return feeRepo.findByStudentId(studentId);
    }

    @PostMapping
    public Fee create(@RequestBody Fee fee) {
        return feeRepo.save(fee);
    }

    @PutMapping("/{id}")
    public Fee update(@PathVariable String id, @RequestBody Fee fee) {
        Fee existing = feeRepo.findById(id).orElseThrow();
        existing.setAmount(fee.getAmount());
        existing.setPaidAmount(fee.getPaidAmount());
        existing.setPendingAmount(fee.getAmount() - fee.getPaidAmount());
        existing.setStatus(existing.getPendingAmount() <= 0 ? "PAID" : (existing.getPaidAmount() > 0 ? "PARTIAL" : "PENDING"));
        return feeRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        feeRepo.deleteById(id);
    }
}
