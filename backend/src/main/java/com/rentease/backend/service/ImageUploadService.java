package com.rentease.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rentease.backend.config.CloudinaryConfig;
import com.rentease.backend.entity.Property;
import com.rentease.backend.entity.PropertyImage;
import com.rentease.backend.repository.PropertyImageRepository;
import com.rentease.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ImageUploadService {

    private final Cloudinary cloudinary;
    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final CloudinaryConfig cloudinaryConfig;
    private final ImageSanitizationService sanitizationService;

    public List<String> uploadImages(Long propertyId,
                                     List<MultipartFile> files,
                                     String landlordEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getEmail().equals(landlordEmail)) {
            throw new RuntimeException(
                    "You can only upload images for your own listings");
        }

        if (files.size() > 5) {
            throw new IllegalArgumentException(
                    "Maximum 5 images allowed per property");
        }

        List<String> uploadedUrls = new ArrayList<>();
        boolean isFirst = propertyImageRepository
                .findByPropertyId(propertyId).isEmpty();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try {
                // ── Sanitize before uploading ──
                // Validates real MIME type, dimensions, strips EXIF
                byte[] sanitizedBytes = sanitizationService.sanitize(file);

                // Upload sanitized bytes to Cloudinary
                Map uploadResult = cloudinary.uploader().upload(
                        sanitizedBytes,
                        ObjectUtils.asMap(
                                "folder", "rentease/properties/" + propertyId,
                                "transformation", "q_auto,f_auto,w_800,h_600,c_fill"
                        )
                );

                String imageUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                // Save to DB
                PropertyImage image = PropertyImage.builder()
                        .property(property)
                        .imageUrl(imageUrl)
                        .publicId(publicId)
                        .primary(isFirst)
                        .build();

                propertyImageRepository.save(image);
                uploadedUrls.add(imageUrl);
                isFirst = false;

                log.info("Image {}/{} sanitized and uploaded for property {}: {}",
                        i + 1, files.size(), propertyId, imageUrl);

            } catch (IllegalArgumentException e) {
                // Sanitization rejection — clean user-facing message
                log.warn("Image {} rejected for property {}: {}",
                        file.getOriginalFilename(), propertyId, e.getMessage());
                throw new IllegalArgumentException(
                        "Image " + (i + 1) + " (" +
                                file.getOriginalFilename() + "): " + e.getMessage());
            } catch (IOException e) {
                log.error("Failed to upload image {}: {}",
                        file.getOriginalFilename(), e.getMessage());
                throw new RuntimeException(
                        "Failed to upload image: " + e.getMessage());
            }
        }

        return uploadedUrls;
    }

    @Transactional
    public void deleteImage(Long imageId, String landlordEmail) {
        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getProperty().getLandlord().getEmail().equals(landlordEmail)) {
            throw new RuntimeException(
                    "You can only delete your own property images");
        }

        try {
            cloudinary.uploader().destroy(
                    image.getPublicId(),
                    ObjectUtils.emptyMap()
            );
            propertyImageRepository.delete(image);
            log.info("Image deleted: {}", image.getPublicId());
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete image: " + e.getMessage());
        }
    }
}