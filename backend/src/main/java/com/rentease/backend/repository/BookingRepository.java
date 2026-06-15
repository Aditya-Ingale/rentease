package com.rentease.backend.repository;

import com.rentease.backend.entity.BookingRequest;
import com.rentease.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingRequest, Long> {

    List<BookingRequest> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<BookingRequest> findByProperty_Landlord_IdOrderByCreatedAtDesc(Long landlordId);

    List<BookingRequest> findByTenantIdAndStatusOrderByCreatedAtDesc(
            Long tenantId, BookingStatus status);

    List<BookingRequest> findByProperty_Landlord_IdAndStatusOrderByCreatedAtDesc(
            Long landlordId, BookingStatus status);

    long countByProperty_Landlord_IdAndStatus(Long landlordId, BookingStatus status);

    boolean existsByTenantIdAndPropertyIdAndStatus(
            Long tenantId, Long propertyId, BookingStatus status);
}