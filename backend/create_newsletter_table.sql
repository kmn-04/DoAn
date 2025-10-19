-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `subscribed_at` DATETIME NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `unsubscribed_at` DATETIME NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_email` (`email` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for active subscribers
CREATE INDEX `idx_is_active` ON `newsletter_subscribers` (`is_active` ASC);

-- Check table
SELECT 'Newsletter table created successfully' AS status;

