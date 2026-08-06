package com.rentease.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String keyId;
    private Long bookingId;
    private String propertyTitle;
    private String tenantName;
    private String tenantEmail;

    // Upfront fee breakdown — the single source of truth the frontend should
    // display AND charge against. Keeps the checkout screen and the actual
    // Razorpay order amount from ever drifting apart.
    private Breakdown breakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Breakdown {
        private Double firstMonth;
        private Double deposit;
        private Double brokerage;
        private Double total;
    }
}