package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Placement;
import com.smartclass.dashboard.entity.PlacementDrive;
import com.smartclass.dashboard.repository.PlacementDriveRepository;
import com.smartclass.dashboard.repository.PlacementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placements")
public class PlacementController {

    @Autowired
    private PlacementRepository placementRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @GetMapping
    public List<Placement> getAllPlacements() {
        return placementRepository.findAll();
    }

    @GetMapping("/latest")
    public Placement getLatestPlacement() {
        List<Placement> all = placementRepository.findAll();
        if (all.isEmpty()) return null;
        return all.get(all.size() - 1);
    }

    @GetMapping("/drives")
    public List<PlacementDrive> getAllDrives() {
        return placementDriveRepository.findAll();
    }

    @PostMapping
    public Placement addPlacement(@RequestBody Placement placement) {
        return placementRepository.save(placement);
    }

    @PostMapping("/drives")
    public PlacementDrive addDrive(@RequestBody PlacementDrive drive) {
        return placementDriveRepository.save(drive);
    }

    @DeleteMapping("/drives/{id}")
    public void deleteDrive(@PathVariable String id) {
        placementDriveRepository.deleteById(id);
    }
}
