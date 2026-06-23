package com.finflow.api.actuator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("stripe") 
public class StripeHealthIndicator implements HealthIndicator {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Override
    public Health health() {
        // Check if the API key is missing or still set to a default placeholder
        if (stripeApiKey == null || stripeApiKey.isBlank() || stripeApiKey.contains("YourBrandNewKeyHere")) {
            return Health.down()
                    .withDetail("status", "Stripe API Key is missing or invalid")
                    .withDetail("action", "Check application.yml configuration")
                    .build();
        }
        
        return Health.up()
                .withDetail("status", "Stripe Gateway Configured")
                .withDetail("key_prefix", stripeApiKey.substring(0, 8) + "...") // Show only the safe prefix
                .build();
    }
}