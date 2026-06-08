package com.rentease.backend.controller;

import com.rentease.backend.dto.*;
import com.rentease.backend.enums.*;
import com.rentease.backend.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // Public — search listings
    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer bhk,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(required = false) FurnishingStatus furnished,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {

        return ResponseEntity.ok(propertyService.searchProperties(
                city, bhk, minRent, maxRent, furnished, propertyType,
                page, size, sortBy));
    }

    // Public — get single property
    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getProperty(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    // Landlord — create listing
    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @RequestBody PropertyRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return ResponseEntity.ok(propertyService.createProperty(request, email));
    }

    // Landlord — update listing
    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return ResponseEntity.ok(propertyService.updateProperty(id, request, email));
    }

    // Landlord — delete listing
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        propertyService.deleteProperty(id, email);
        return ResponseEntity.noContent().build();
    }

    // Landlord — get own listings
    @GetMapping("/my-listings")
    public ResponseEntity<List<PropertyResponse>> getMyListings() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return ResponseEntity.ok(propertyService.getLandlordProperties(email));
    }
}