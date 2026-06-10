package com.rentease.backend.config;

import com.rentease.backend.service.AmenityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final AmenityService amenityService;

    @Override
    public void run(ApplicationArguments args) {
        amenityService.seedDefaultAmenities();
        log.info("Default amenities seeded successfully");
    }
}