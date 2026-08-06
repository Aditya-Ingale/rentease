package com.rentease.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

@Service
@Slf4j
public class ImageSanitizationService {

    private static final Tika tika = new Tika();

    // Allowed MIME types — strictly images only
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private static final Set<String> BLOCKED_MIME_TYPES = Set.of(
            "image/svg+xml",
            "image/svg",
            "text/html",
            "text/xml",
            "application/xml",
            "application/javascript"
    );

    // Max dimensions — prevent pixel bombs
    private static final int MAX_WIDTH = 8000;
    private static final int MAX_HEIGHT = 8000;

    // Max file size — 10MB
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024;

    /**
     * Full sanitization pipeline:
     * 1. Size check
     * 2. Real MIME type detection (not just extension)
     * 3. Dimension check
     * 4. Re-encode to strip EXIF and embedded metadata
     */
    public byte[] sanitize(MultipartFile file) throws IOException {

        // ── Step 1: Size check ──
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "Image too large. Maximum size is 10MB.");
        }

        byte[] originalBytes = file.getBytes();

        // ── Step 2: Real MIME type detection ──
        // Tika reads file headers (magic bytes) not just filename
        String detectedMime = tika.detect(originalBytes);
        log.info("Detected MIME type: {} for file: {}",
                detectedMime, file.getOriginalFilename());

        if (!ALLOWED_MIME_TYPES.contains(detectedMime)) {
            throw new IllegalArgumentException(
                    "Invalid file type: " + detectedMime +
                            ". Only JPEG, PNG, and WebP images are allowed.");
        }

        if (BLOCKED_MIME_TYPES.contains(detectedMime)) {
            throw new IllegalArgumentException(
                    "File type " + detectedMime + " is not allowed.");
        }

        // ── Step 3: Decode image — validates it's actually an image ──
        BufferedImage image = ImageIO.read(
                new ByteArrayInputStream(originalBytes));

        if (image == null) {
            throw new IllegalArgumentException(
                    "File could not be read as an image. " +
                            "It may be corrupted or disguised.");
        }

        // ── Step 4: Dimension check ──
        if (image.getWidth() > MAX_WIDTH ||
                image.getHeight() > MAX_HEIGHT) {
            throw new IllegalArgumentException(
                    "Image dimensions too large. Maximum " +
                            MAX_WIDTH + "x" + MAX_HEIGHT + " pixels.");
        }

        // ── Step 5: Re-encode to strip ALL metadata ──
        // Reading and re-writing as JPEG strips:
        // - EXIF data (GPS, device info, timestamps)
        // - ICC profiles
        // - Thumbnail previews
        // - Any embedded scripts or hidden data
        ByteArrayOutputStream cleanOutput = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", cleanOutput);

        byte[] sanitizedBytes = cleanOutput.toByteArray();

        log.info("Image sanitized: original={}KB → clean={}KB, " +
                        "dimensions={}x{}",
                originalBytes.length / 1024,
                sanitizedBytes.length / 1024,
                image.getWidth(),
                image.getHeight());

        return sanitizedBytes;
    }

    /**
     * Sanitize multiple files — returns sanitized byte arrays
     */
    public byte[][] sanitizeAll(MultipartFile[] files) throws IOException {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided.");
        }

        if (files.length > 5) {
            throw new IllegalArgumentException(
                    "Maximum 5 images allowed per property.");
        }

        byte[][] sanitized = new byte[files.length][];
        for (int i = 0; i < files.length; i++) {
            try {
                sanitized[i] = sanitize(files[i]);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "File " + (i + 1) + " (" +
                                files[i].getOriginalFilename() + "): " +
                                e.getMessage());
            }
        }
        return sanitized;
    }
}