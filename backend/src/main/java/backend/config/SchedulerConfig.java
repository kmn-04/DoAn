package backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration for Spring Scheduling
 * Enables @Scheduled annotations for scheduled jobs
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Scheduling is now enabled for the application
    // Any @Scheduled methods in @Service or @Component beans will run automatically
}

