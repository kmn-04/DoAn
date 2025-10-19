-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: doan
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Khám Phá Vịnh Hạ Long','Di sản thế giới UNESCO - Vẻ đẹp huyền bí của vịnh biển đẹp nhất Việt Nam','https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&h=800&fit=crop','/tours/ha-noi-ha-long-ninh-binh-3n2d','Khám Phá Ngay',1,1,NULL,NULL,'2025-10-08 15:03:56','2025-10-16 16:31:21'),(2,'Phiêu Lưu Mạo Hiểm','Trải nghiệm những hoạt động thú vị và thách thức bản thân','https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=800&fit=crop','/tours?category=du-lich-mao-hiem','Xem Tours',2,1,NULL,NULL,'2025-10-08 15:03:56','2025-10-08 08:13:54'),(3,'Nghỉ Dưỡng Biển Đảo','Thư giãn tại những bãi biển đẹp nhất Việt Nam','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=800&fit=crop','/tours?category=du-lich-bien','Tìm Hiểu Thêm',3,1,NULL,NULL,'2025-10-08 15:03:56','2025-10-08 08:13:58');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blacklisted_tokens`
--

DROP TABLE IF EXISTS `blacklisted_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklisted_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_blacklisted_tokens_expires_at` (`expires_at`),
  KEY `idx_blacklisted_tokens_user_email` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklisted_tokens`
--

LOCK TABLES `blacklisted_tokens` WRITE;
/*!40000 ALTER TABLE `blacklisted_tokens` DISABLE KEYS */;
INSERT INTO `blacklisted_tokens` VALUES (1,'2025-10-16 15:27:26.720929','2025-10-17 14:24:28.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNjI0NjY4LCJleHAiOjE3NjA3MTEwNjh9.qkqeuv23dVeUOLNMngY_3UjgqOFF73J1FDKF-ptcWKi1MOLvOuen5kbwChgE5w9n','admin@travelbooking.vn'),(2,'2025-10-16 16:20:52.076882','2025-10-17 15:57:45.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJkYW8wMzEyQGdtYWlsLmNvbSIsImlhdCI6MTc2MDYzMDI2NSwiZXhwIjoxNzYwNzE2NjY1fQ.nI9-sxWgSOELkZamU99TgOBNF-CcUNFOJthJ2ntNZowfly3SXYAb-gMGZ_vPeOFT','dao0312@gmail.com'),(3,'2025-10-17 13:19:26.959535','2025-10-17 16:09:06.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNjMwOTQ2LCJleHAiOjE3NjA3MTczNDZ9.gOguOekyHEFR7b7m6Q1ueYOx0vSbaaidExRO1BTlDJUoURvvhEZVDcg6ijox_LTn','admin@travelbooking.vn'),(4,'2025-10-17 13:21:04.298360','2025-10-18 13:19:31.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNzA3MTcxLCJleHAiOjE3NjA3OTM1NzF9.uXG2C16cwejAw9d6JASu6aaGlau-NDvupjO5fAlOyZhqE1X3y8DZDi9Pahn2WlEG','admin@travelbooking.vn'),(5,'2025-10-17 13:42:17.753463','2025-10-18 13:21:17.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJkYW8wMzEyQGdtYWlsLmNvbSIsImlhdCI6MTc2MDcwNzI3NywiZXhwIjoxNzYwNzkzNjc3fQ.7Hnk2dujuGc5CJDS0v72j89cB3d5kcTuJqtDRuesGf_EKUgcQcljDuKwwC1C_o56','dao0312@gmail.com'),(6,'2025-10-17 15:18:53.362574','2025-10-18 13:48:53.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNzA4OTMzLCJleHAiOjE3NjA3OTUzMzN9.P3j0u4kAoOfUu0nQjuhbh-qsomv8_y30FABZktLCt5fg7qNVoJ7Gcs8iSttDGhYD','admin@travelbooking.vn'),(7,'2025-10-18 10:39:49.077563','2025-10-18 15:18:57.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNzE0MzM3LCJleHAiOjE3NjA4MDA3Mzd9.kqpyS6jHYH75wipNIh71vPVJ5a4f_rh7ajNrW5ZkZcbfHFaJNnyUkW9ZsqfiENqO','admin@travelbooking.vn'),(8,'2025-10-18 10:49:19.185495','2025-10-19 10:41:32.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjA3ODQwOTIsImV4cCI6MTc2MDg3MDQ5Mn0.inzikBxU2oEwKfK5Qi_sJU6S4Ei7A2mQgps6o8dB1xsNczEsRrHp5BAViDMEX7Sf','khoi1411998@gmail.com'),(9,'2025-10-18 10:49:31.698505','2025-10-19 10:49:24.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjA3ODQ1NjQsImV4cCI6MTc2MDg3MDk2NH0.CQXTH_jJSng6UXGyxuSfmjW1fj-pEEiEaeWHECIim8HRccs2vSapg5j1xRo0_7j6','khoi1411998@gmail.com'),(10,'2025-10-18 10:57:06.288914','2025-10-19 10:50:09.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjA3ODQ2MDksImV4cCI6MTc2MDg3MTAwOX0.08GOfEErS5uiwlTaNsu6T90CTUJDyWX1XhouH6rCd-ydyUuE2XOhFWPh5fMvLHAB','khoi1411998@gmail.com'),(11,'2025-10-18 11:55:14.487721','2025-10-19 10:57:09.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjA3ODUwMjksImV4cCI6MTc2MDg3MTQyOX0.QyZqvha1RVlZTdtpz00HMfqVA-ELJaZHJ1zbmlHBXlOS-jwle-rFruVPfpmAov-t','khoi1411998@gmail.com'),(12,'2025-10-18 11:55:32.297149','2025-10-18 13:50:29.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTExOUBnbWFpbC5jb20iLCJpYXQiOjE3NjA3MDkwMjksImV4cCI6MTc2MDc5NTQyOX0.iOihySWWmBN65p5cZFEmY_lZyJA2ppIrLcUw1CGNM_kHZDNUyADvF6TjTsLAXd86','khoi1411119@gmail.com'),(13,'2025-10-18 14:26:16.977301','2025-10-19 10:41:44.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwNzg0MTA0LCJleHAiOjE3NjA4NzA1MDR9.SZ75dm-RlxGop720SgT2gwb9f-Kg94Ad-_jjLqxNKoZJHOS36TknWiwX5GZZPDMy','admin@travelbooking.vn'),(14,'2025-10-18 15:03:25.909711','2025-10-19 14:26:23.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pQGdtYWlsLmNvbSIsImlhdCI6MTc2MDc5NzU4MywiZXhwIjoxNzYwODgzOTgzfQ.PhhhRhRk7Y9NoUN346aS2X3rYqAvHTxGA-zK8q1bXu9kN0HTdwq27Vzoh8-vvKNb','khoi@gmail.com'),(15,'2025-10-19 05:50:09.644504','2025-10-19 15:03:39.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJraG9pMTQxMTk5OUBnbWFpbC5jb20iLCJpYXQiOjE3NjA3OTk4MTksImV4cCI6MTc2MDg4NjIxOX0.nkjt12Fc9MXVB5GyAVlMQ9gS1aTyn6nhqfrIlhHBA4qVPBx-JXEycpDHEH-lLvLB','khoi1411999@gmail.com'),(16,'2025-10-19 07:56:44.592688','2025-10-20 05:50:14.000000',NULL,'User logout','eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkB0cmF2ZWxib29raW5nLnZuIiwiaWF0IjoxNzYwODUzMDE0LCJleHAiOjE3NjA5Mzk0MTR9.JRRn_jWKczhjQPDC0Lhrvey6YwV28m7_syVauLM7rKMj6RPlpUGMVxEJaFq-N6Pi','admin@travelbooking.vn');
/*!40000 ALTER TABLE `blacklisted_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_cancellations`
--

DROP TABLE IF EXISTS `booking_cancellations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_cancellations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `cancelled_by_user_id` bigint NOT NULL,
  `cancellation_policy_id` bigint NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_category` enum('PERSONAL_EMERGENCY','MEDICAL_EMERGENCY','WEATHER_CONDITIONS','FORCE_MAJEURE','TRAVEL_RESTRICTIONS','SCHEDULE_CONFLICT','FINANCIAL_DIFFICULTY','DISSATISFACTION','DUPLICATE_BOOKING','TECHNICAL_ERROR','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `additional_notes` text COLLATE utf8mb4_unicode_ci,
  `original_amount` decimal(10,2) NOT NULL,
  `refund_percentage` decimal(5,2) NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `cancellation_fee` decimal(10,2) DEFAULT '0.00',
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `final_refund_amount` decimal(10,2) NOT NULL,
  `hours_before_departure` int NOT NULL,
  `departure_date` datetime NOT NULL,
  `cancelled_at` datetime NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `refund_status` enum('PENDING','PROCESSING','COMPLETED','FAILED','NOT_APPLICABLE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `processed_by_user_id` bigint DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `is_medical_emergency` tinyint(1) DEFAULT '0',
  `is_weather_related` tinyint(1) DEFAULT '0',
  `is_force_majeure` tinyint(1) DEFAULT '0',
  `supporting_documents` text COLLATE utf8mb4_unicode_ci,
  `refund_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `detailed_reason` text COLLATE utf8mb4_unicode_ci,
  `requested_by` bigint NOT NULL,
  `previous_booking_status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED','CANCELLATION_REQUESTED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_cancellation` (`booking_id`),
  KEY `cancellation_policy_id` (`cancellation_policy_id`),
  KEY `processed_by_user_id` (`processed_by_user_id`),
  KEY `idx_cancellation_booking` (`booking_id`),
  KEY `idx_cancellation_user` (`cancelled_by_user_id`),
  KEY `idx_cancellation_status` (`status`),
  KEY `idx_cancellation_refund_status` (`refund_status`),
  KEY `idx_cancellation_reason` (`reason_category`),
  KEY `idx_cancellation_date` (`cancelled_at`),
  KEY `idx_cancellation_emergency` (`is_medical_emergency`,`is_weather_related`,`is_force_majeure`),
  KEY `idx_cancellation_processed` (`processed_at`),
  KEY `FKsnqwrp220trju8sdre7ex6oao` (`requested_by`),
  CONSTRAINT `booking_cancellations_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `booking_cancellations_ibfk_2` FOREIGN KEY (`cancelled_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `booking_cancellations_ibfk_3` FOREIGN KEY (`cancellation_policy_id`) REFERENCES `cancellation_policies` (`id`),
  CONSTRAINT `booking_cancellations_ibfk_4` FOREIGN KEY (`processed_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKsnqwrp220trju8sdre7ex6oao` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  CONSTRAINT `booking_cancellations_chk_1` CHECK ((`final_refund_amount` >= 0)),
  CONSTRAINT `booking_cancellations_chk_2` CHECK ((`hours_before_departure` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_cancellations`
--

LOCK TABLES `booking_cancellations` WRITE;
/*!40000 ALTER TABLE `booking_cancellations` DISABLE KEYS */;
INSERT INTO `booking_cancellations` VALUES (1,1,999,3,'aaaaaaaaaaaaa','OTHER','',9770000.00,90.00,8793000.00,100000.00,50000.00,8643000.00,301,'2025-10-14 17:00:00','2025-10-02 03:17:47','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-01 20:17:47','2025-10-16 03:54:21','',999,NULL),(2,27,1196,3,'abcccccccccccccccccccc','TRAVEL_RESTRICTIONS','',2490000.00,90.00,2241000.00,100000.00,50000.00,2091000.00,81,'2025-10-18 17:00:00','2025-10-15 07:37:02','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-15 00:37:02','2025-10-16 03:54:21','',1196,NULL),(3,26,1196,3,'aaaaaaaaaaaaaaaaaaa','OTHER','',2290000.00,90.00,2061000.00,100000.00,50000.00,1911000.00,105,'2025-10-19 17:00:00','2025-10-15 07:40:11','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-15 00:40:11','2025-10-16 03:54:21','',1196,NULL),(4,25,1196,3,'abcaaaaaaaaa','OTHER','',1890000.00,90.00,1701000.00,100000.00,50000.00,1551000.00,369,'2025-10-30 17:00:00','2025-10-15 07:44:02','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-15 00:44:02','2025-10-16 03:54:21','',1196,NULL),(5,24,1196,3,'aaaaaaaaaaaaaaaaaa','OTHER','',11430000.00,90.00,10287000.00,100000.00,50000.00,10137000.00,129,'2025-10-20 17:00:00','2025-10-15 07:49:23','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-15 00:49:23','2025-10-16 03:54:21','',1196,NULL),(6,19,1196,3,'aaaaaaaaaaaaaaaaaa','OTHER','',1890000.00,90.00,1701000.00,100000.00,50000.00,1551000.00,200,'2025-10-23 17:00:00','2025-10-15 08:14:29','PENDING','PENDING',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,'2025-10-15 01:14:29','2025-10-16 03:54:21','',1196,NULL),(7,28,1197,3,'11111111111111111','OTHER','',2490000.00,30.00,747000.00,100000.00,50000.00,597000.00,60,'2025-10-18 17:00:00','2025-10-16 04:16:24','APPROVED','COMPLETED',1,'2025-10-16 04:16:39','',0,0,0,NULL,NULL,NULL,'2025-10-16 04:27:48','2025-10-15 01:24:29','2025-10-15 21:27:48','',1197,'CONFIRMED'),(8,29,1197,3,'aqweertrtyuyi','OTHER','',6490000.00,90.00,5841000.00,100000.00,50000.00,5691000.00,145,'2025-10-21 17:00:00','2025-10-15 15:14:36','APPROVED','COMPLETED',1,'2025-10-16 04:07:33','',0,0,0,NULL,NULL,NULL,'2025-10-16 04:27:35','2025-10-15 08:14:36','2025-10-15 21:27:35','',1197,'PENDING'),(11,30,1202,3,'Thay đổi lịch trình cá nhân','OTHER','',6723000.00,90.00,6050700.00,100000.00,50000.00,5900700.00,216,'2025-10-25 17:00:00','2025-10-16 16:13:51','APPROVED','COMPLETED',1,'2025-10-16 16:26:31','',0,0,0,NULL,NULL,NULL,'2025-10-16 16:27:25','2025-10-16 09:13:51','2025-10-16 09:27:25','',1202,'PENDING'),(12,33,1204,3,'11111111111','OTHER','',1890000.00,90.00,1701000.00,100000.00,50000.00,1551000.00,146,'2025-10-23 17:00:00','2025-10-17 14:11:15','APPROVED','COMPLETED',1,'2025-10-17 14:11:28','',0,0,0,NULL,NULL,NULL,'2025-10-17 14:11:37','2025-10-17 07:10:33','2025-10-17 07:11:37','',1204,'CONFIRMED');
/*!40000 ALTER TABLE `booking_cancellations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_modifications`
--

DROP TABLE IF EXISTS `booking_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_modifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `requested_by_user_id` bigint NOT NULL,
  `approved_by_user_id` bigint DEFAULT NULL,
  `processed_by_user_id` bigint DEFAULT NULL,
  `modification_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `original_start_date` date DEFAULT NULL,
  `original_end_date` date DEFAULT NULL,
  `original_participants` int DEFAULT NULL,
  `original_amount` decimal(10,2) DEFAULT NULL,
  `new_start_date` date DEFAULT NULL,
  `new_end_date` date DEFAULT NULL,
  `new_participants` int DEFAULT NULL,
  `new_amount` decimal(10,2) DEFAULT NULL,
  `price_difference` decimal(10,2) DEFAULT '0.00',
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_notes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_notes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcj2dtpn5qj62soko1r28gqhb0` (`booking_id`),
  KEY `FKm2m2vvwexf46u1kqdfnihp9fb` (`requested_by_user_id`),
  CONSTRAINT `FKcj2dtpn5qj62soko1r28gqhb0` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKm2m2vvwexf46u1kqdfnihp9fb` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_booking_modification_status` CHECK ((`status` in (_utf8mb4'REQUESTED',_utf8mb4'UNDER_REVIEW',_utf8mb4'APPROVED',_utf8mb4'REJECTED',_utf8mb4'PROCESSING',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `chk_booking_modification_type` CHECK ((`modification_type` in (_utf8mb4'DATE_CHANGE',_utf8mb4'PARTICIPANT_CHANGE',_utf8mb4'DATE_AND_PARTICIPANT_CHANGE',_utf8mb4'UPGRADE_TOUR_PACKAGE',_utf8mb4'ACCOMMODATION_CHANGE',_utf8mb4'OTHER')))
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_modifications`
--

LOCK TABLES `booking_modifications` WRITE;
/*!40000 ALTER TABLE `booking_modifications` DISABLE KEYS */;
INSERT INTO `booking_modifications` VALUES (1,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 14:20:09','2025-09-30 14:20:09',NULL,NULL,NULL),(2,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 14:20:09','2025-09-30 14:20:09',NULL,NULL,NULL),(3,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 14:23:51','2025-09-30 14:23:51',NULL,NULL,NULL),(4,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 14:23:51','2025-09-30 14:23:51',NULL,NULL,NULL),(5,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 14:25:09','2025-09-30 14:25:09',NULL,NULL,NULL),(6,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 14:25:09','2025-09-30 14:25:09',NULL,NULL,NULL),(7,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 14:47:56','2025-09-30 14:47:56',NULL,NULL,NULL),(8,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 14:47:56','2025-09-30 14:47:56',NULL,NULL,NULL),(9,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 14:57:01','2025-09-30 14:57:01',NULL,NULL,NULL),(10,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 14:57:01','2025-09-30 14:57:01',NULL,NULL,NULL),(11,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:03:49','2025-09-30 15:03:49',NULL,NULL,NULL),(12,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:03:49','2025-09-30 15:03:49',NULL,NULL,NULL),(13,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:09:50','2025-09-30 15:09:50',NULL,NULL,NULL),(14,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:09:50','2025-09-30 15:09:50',NULL,NULL,NULL),(15,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:10:22','2025-09-30 15:10:22',NULL,NULL,NULL),(16,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:10:22','2025-09-30 15:10:22',NULL,NULL,NULL),(17,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:10:53','2025-09-30 15:10:53',NULL,NULL,NULL),(18,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:10:53','2025-09-30 15:10:53',NULL,NULL,NULL),(19,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:14:57','2025-09-30 15:14:57',NULL,NULL,NULL),(20,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:14:57','2025-09-30 15:14:57',NULL,NULL,NULL),(21,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:17:40','2025-09-30 15:17:40',NULL,NULL,NULL),(22,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:17:40','2025-09-30 15:17:40',NULL,NULL,NULL),(23,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:18:34','2025-09-30 15:18:34',NULL,NULL,NULL),(24,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:18:34','2025-09-30 15:18:34',NULL,NULL,NULL),(25,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:20:55','2025-09-30 15:20:55',NULL,NULL,NULL),(26,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:20:55','2025-09-30 15:20:55',NULL,NULL,NULL),(27,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:24:34','2025-09-30 15:24:34',NULL,NULL,NULL),(28,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:24:34','2025-09-30 15:24:34',NULL,NULL,NULL),(29,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:26:36','2025-09-30 15:26:36',NULL,NULL,NULL),(30,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:26:36','2025-09-30 15:26:36',NULL,NULL,NULL),(31,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:31:26','2025-09-30 15:31:26',NULL,NULL,NULL),(32,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:31:26','2025-09-30 15:31:26',NULL,NULL,NULL),(33,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:35:10','2025-09-30 15:35:10',NULL,NULL,NULL),(34,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:35:10','2025-09-30 15:35:10',NULL,NULL,NULL),(35,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:36:56','2025-09-30 15:36:56',NULL,NULL,NULL),(36,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:36:56','2025-09-30 15:36:56',NULL,NULL,NULL),(37,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:38:48','2025-09-30 15:38:48',NULL,NULL,NULL),(38,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:38:48','2025-09-30 15:38:48',NULL,NULL,NULL),(39,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:46:37','2025-09-30 15:46:37',NULL,NULL,NULL),(40,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:46:37','2025-09-30 15:46:37',NULL,NULL,NULL),(41,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 15:57:23','2025-09-30 15:57:23',NULL,NULL,NULL),(42,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 15:57:23','2025-09-30 15:57:23',NULL,NULL,NULL),(43,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:06:22','2025-09-30 16:06:22',NULL,NULL,NULL),(44,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:06:22','2025-09-30 16:06:22',NULL,NULL,NULL),(45,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:10:49','2025-09-30 16:10:49',NULL,NULL,NULL),(46,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:10:49','2025-09-30 16:10:49',NULL,NULL,NULL),(47,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:23:56','2025-09-30 16:23:56',NULL,NULL,NULL),(48,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:23:56','2025-09-30 16:23:56',NULL,NULL,NULL),(49,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:29:31','2025-09-30 16:29:31',NULL,NULL,NULL),(50,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:29:31','2025-09-30 16:29:31',NULL,NULL,NULL),(51,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:36:45','2025-09-30 16:36:45',NULL,NULL,NULL),(52,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:36:45','2025-09-30 16:36:45',NULL,NULL,NULL),(53,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:47:12','2025-09-30 16:47:12',NULL,NULL,NULL),(54,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:47:12','2025-09-30 16:47:12',NULL,NULL,NULL),(55,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 16:55:02','2025-09-30 16:55:02',NULL,NULL,NULL),(56,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 16:55:02','2025-09-30 16:55:02',NULL,NULL,NULL),(57,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 17:04:25','2025-09-30 17:04:25',NULL,NULL,NULL),(58,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 17:04:25','2025-09-30 17:04:25',NULL,NULL,NULL),(59,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 17:06:24','2025-09-30 17:06:24',NULL,NULL,NULL),(60,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 17:06:24','2025-09-30 17:06:24',NULL,NULL,NULL),(61,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 17:09:02','2025-09-30 17:09:02',NULL,NULL,NULL),(62,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 17:09:02','2025-09-30 17:09:02',NULL,NULL,NULL),(63,1,1,NULL,NULL,'DATE_CHANGE','REQUESTED','2024-01-15','2024-01-15',2,500.00,'2024-01-22','2024-01-22',2,500.00,0.00,25.00,'Change travel date due to work schedule conflict','Would prefer morning departure if available',NULL,'2025-09-30 17:27:04','2025-09-30 17:27:04',NULL,NULL,NULL),(64,1,1,NULL,NULL,'PARTICIPANT_CHANGE','APPROVED','2024-02-10','2024-02-10',2,800.00,'2024-02-10','2024-02-10',4,1000.00,200.00,25.00,'Adding 2 more family members','Two additional adults joining the tour',NULL,'2025-09-28 17:27:04','2025-09-30 17:27:04',NULL,NULL,NULL);
/*!40000 ALTER TABLE `booking_modifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_participants`
--

DROP TABLE IF EXISTS `booking_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_participants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('FEMALE','MALE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `id_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_type` enum('CMND','CCCD','Passport') COLLATE utf8mb4_unicode_ci DEFAULT 'CMND',
  `nationality` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `participant_type` enum('ADULT','CHILD','INFANT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `special_requirements` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_of_birth` date DEFAULT NULL,
  `passport_expiry` date DEFAULT NULL,
  `passport_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_participants_booking_id` (`booking_id`),
  KEY `idx_participants_booking` (`booking_id`),
  CONSTRAINT `booking_participants_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_participants`
--

LOCK TABLES `booking_participants` WRITE;
/*!40000 ALTER TABLE `booking_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `tour_id` bigint DEFAULT NULL,
  `schedule_id` bigint DEFAULT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `num_adults` int DEFAULT '1',
  `num_children` int DEFAULT '0',
  `num_infants` int DEFAULT '0',
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `final_amount` decimal(12,2) NOT NULL,
  `promotion_id` bigint DEFAULT NULL,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `confirmation_status` enum('CANCELLATION_REQUESTED','CANCELLED','COMPLETED','CONFIRMED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('PAID','REFUNDED','REFUNDING','UNPAID') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_by` bigint DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reminder_sent` tinyint(1) DEFAULT '0' COMMENT 'Whether reminder email has been sent',
  `reminder_sent_at` datetime DEFAULT NULL COMMENT 'When reminder email was sent',
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `schedule_id` (`schedule_id`),
  KEY `promotion_id` (`promotion_id`),
  KEY `cancelled_by` (`cancelled_by`),
  KEY `idx_bookings_booking_code` (`booking_code`),
  KEY `idx_bookings_user_id` (`user_id`),
  KEY `idx_bookings_tour_id` (`tour_id`),
  KEY `idx_bookings_confirmation_status` (`confirmation_status`),
  KEY `idx_bookings_payment_status` (`payment_status`),
  KEY `idx_bookings_start_date` (`start_date`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_tour` (`tour_id`),
  KEY `idx_bookings_reminder` (`reminder_sent`,`start_date`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `tour_schedules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK77807711214',999,3,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2026-01-26',1,0,0,2790000.00,2790000.00,0.00,2790000.00,NULL,NULL,'PENDING','REFUNDED',NULL,NULL,NULL,'2025-10-01 21:03:28','2025-10-15 16:13:24','0123467891',0,NULL),(2,'BK78504112251',999,5,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-07',1,0,0,4990000.00,4990000.00,0.00,4990000.00,NULL,NULL,'CONFIRMED','PAID',NULL,NULL,NULL,'2025-10-01 21:15:04','2025-10-15 16:13:24','0123456789',0,NULL),(3,'BK7854991231',999,5,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-07',1,0,0,4990000.00,4990000.00,0.00,4990000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-01 21:15:50','2025-10-15 16:13:24','0132456789',0,NULL),(4,'BK80511903685',999,9,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2026-01-25',1,1,0,3190000.00,5423000.00,0.00,5423000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-01 21:48:32','2025-10-15 16:13:24','0123456789',0,NULL),(5,'BK8064301439',999,10,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-07',4,0,0,5390000.00,21560000.00,0.00,21560000.00,NULL,NULL,'PENDING','REFUNDED',NULL,NULL,NULL,'2025-10-01 21:50:43','2025-10-15 16:13:24','0123456789',0,NULL),(6,'BK81113143160',999,5,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-14',1,0,0,4990000.00,4990000.00,0.00,4990000.00,NULL,NULL,'PENDING','REFUNDING',NULL,NULL,NULL,'2025-10-01 21:58:33','2025-10-15 16:13:24','0123465798',0,NULL),(7,'BK81324694510',999,7,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-12',1,0,0,3290000.00,3290000.00,0.00,3290000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-01 22:02:05','2025-10-15 16:13:24','0123456798',0,NULL),(8,'BK81557098357',999,30,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-20',1,0,0,44990000.00,44990000.00,0.00,44990000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-01 22:05:57','2025-10-15 16:13:24','0123456798',0,NULL),(9,'BK81919421661',999,12,NULL,'Nguyễn Văn A','customer@test.com','0912345678',NULL,'2025-10-06',1,0,0,2290000.00,2290000.00,0.00,2290000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-01 22:11:59','2025-10-15 16:13:24','0132456798',0,NULL),(10,'BK82634770473',NULL,1,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-11-16',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'PENDING','REFUNDED',NULL,NULL,NULL,'2025-10-01 22:23:55','2025-10-15 16:13:24','0132798465',0,NULL),(11,'BK82711263145',NULL,2,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-10-05',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-01 22:25:11','2025-10-15 16:13:24','0123456798',0,NULL),(12,'BK0002405436',NULL,4,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-10-08',1,0,0,6490000.00,6490000.00,0.00,6490000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 03:13:44','2025-10-15 16:13:24','0123456789',0,NULL),(13,'BK00451076181',NULL,11,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-10-08',1,0,0,6490000.00,6490000.00,0.00,6490000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 03:20:51','2025-10-15 16:13:24','0132456798',0,NULL),(14,'BK00546183853',NULL,2,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-11-14',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 03:22:26','2025-10-15 16:13:24','0123465789',0,NULL),(15,'BK00685698105',NULL,5,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-10-14',1,0,0,4990000.00,4990000.00,0.00,4990000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 03:24:46','2025-10-15 16:13:24','0123456789',0,NULL),(16,'BK01439788949',NULL,6,NULL,'khoi','khoi@gmail.com','0868541104',NULL,'2025-10-06',1,0,0,3490000.00,3490000.00,0.00,3490000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 03:37:20','2025-10-15 16:13:24','0123465798',0,NULL),(17,'BK1059108549',1,1,NULL,'string','admin@travelbooking.vn','04650224428',NULL,'2025-11-15',2,0,0,2490000.00,4980000.00,0.00,4980000.00,NULL,'Test cash payment','PENDING','UNPAID',NULL,NULL,NULL,'2025-10-02 06:09:51','2025-10-15 16:13:24',NULL,0,NULL),(18,'BK44067844344',1196,6,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-20',1,0,0,3490000.00,3490000.00,0.00,3490000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-13 01:27:48','2025-10-15 16:13:24','0132457891',0,NULL),(19,'BK44259229983',1196,2,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-24',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'CANCELLATION_REQUESTED','PAID',NULL,NULL,NULL,'2025-10-13 01:30:59','2025-10-15 16:13:24','0124567893',0,NULL),(20,'BK64440782268',1,7,NULL,'Admin','admin@travelbooking.vn','0868541104',NULL,'2025-10-19',1,0,0,3290000.00,3290000.00,0.00,3290000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-13 07:07:21','2025-10-15 16:13:24','0123456879',0,NULL),(21,'BK645351021',1,7,NULL,'Admin','admin@travelbooking.vn','0868541104',NULL,'2025-11-23',1,0,0,3290000.00,3290000.00,0.00,3290000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-13 07:08:55','2025-10-15 16:13:24','0123456789',0,NULL),(22,'BK12398683497',1196,5,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-11-18',1,0,0,4990000.00,4990000.00,0.00,4990000.00,NULL,NULL,'PENDING','UNPAID',NULL,NULL,NULL,'2025-10-15 00:13:19','2025-10-15 16:13:24','0123456789',0,NULL),(23,'BK12702885111',1196,1,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-19',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-15 00:18:23','2025-10-15 16:13:24','0132456789',0,NULL),(24,'BK12877915413',1196,25,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-21',1,0,0,11430000.00,11430000.00,0.00,11430000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-15 00:21:18','2025-10-15 16:13:24','0132548791',0,NULL),(25,'BK13142955535',1196,2,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-31',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-15 00:25:43','2025-10-15 16:13:24','0213457896',0,NULL),(26,'BK13403280794',1196,12,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-20',1,0,0,2290000.00,2290000.00,0.00,2290000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-15 00:30:03','2025-10-15 16:13:24','0123456791',0,NULL),(27,'BK13492269766',1196,1,NULL,'khoi123456789','khoi@gmail.com','0123456789',NULL,'2025-10-19',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'CONFIRMED','PAID',NULL,NULL,NULL,'2025-10-15 00:31:32','2025-10-15 21:34:19','0132456789',0,NULL),(28,'BK16607260514',1197,1,NULL,'test123','test@gmail.com','0123456789',NULL,'2025-10-19',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'CANCELLED','UNPAID',NULL,NULL,NULL,'2025-10-15 01:23:27','2025-10-15 21:34:22','0123456789',0,NULL),(29,'BK41213247474',1197,4,NULL,'test123','test@gmail.com','0123456789',NULL,'2025-10-22',1,0,0,6490000.00,6490000.00,0.00,6490000.00,NULL,NULL,'CANCELLED','UNPAID',NULL,NULL,NULL,'2025-10-15 08:13:33','2025-10-15 21:34:27','0123456798',0,NULL),(30,'BK31079952964',1202,1,NULL,'Dao','dao0312@gmail.com','0868541104',NULL,'2025-10-26',2,1,0,2490000.00,6723000.00,0.00,6723000.00,NULL,NULL,'CANCELLED','REFUNDED',NULL,NULL,NULL,'2025-10-16 09:11:20','2025-10-16 09:27:25','0123456789',0,NULL),(31,'BK31285997186',1202,2,NULL,'Dao','dao0312@gmail.com','0868541104',NULL,'2025-10-24',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-16 09:14:46','2025-10-16 09:15:21','0123456789',0,NULL),(32,'BK07415737498',1202,1,NULL,'Dao','dao0312@gmail.com','0868541104',NULL,'2025-11-02',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'PENDING','PAID',NULL,NULL,NULL,'2025-10-17 06:23:36','2025-10-17 06:24:12','0123456798',0,NULL),(33,'BK10154363208',1204,2,NULL,'nmk','khoi1411119@gmail.com','0123456789',NULL,'2025-10-24',1,0,0,1890000.00,1890000.00,0.00,1890000.00,NULL,NULL,'CANCELLED','REFUNDED',NULL,NULL,NULL,'2025-10-17 07:09:14','2025-10-17 07:11:37','0123456789',0,NULL),(34,'BK1465921827',1204,1,NULL,'nmk','khoi1411119@gmail.com','0123456789',NULL,'2025-10-26',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-17 08:24:19','2025-10-17 08:30:47','0123456789',0,NULL),(35,'BK15078048845',1204,3,NULL,'nmk','khoi1411119@gmail.com','0123456789',NULL,'2025-11-03',1,0,0,2790000.00,2790000.00,0.00,2790000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-17 08:31:18','2025-10-17 08:32:11','0123456789',0,NULL),(36,'BK86864912972',1205,25,NULL,'Point','khoi1411998@gmail.com','0132465978',NULL,'2025-10-28',1,0,0,11430000.00,11430000.00,0.00,11430000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-18 04:27:45','2025-10-18 04:46:04','0132465978',0,NULL),(37,'BK88605448543',1204,6,NULL,'nmk','khoi1411119@gmail.com','0123456789',NULL,'2025-10-27',1,0,0,3490000.00,3490000.00,0.00,3490000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-18 04:56:45','2025-10-18 04:57:27','0123456789',0,NULL),(38,'BK88806168902',1206,1,NULL,'KMNKMN','khoi1411999@gmail.com','0123456789',NULL,'2025-10-26',1,0,0,2490000.00,2490000.00,0.00,2490000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-18 05:00:06','2025-10-18 05:01:37','0123456789',0,NULL),(39,'BK89170116413',1206,7,NULL,'KMNKMN','khoi1411999@gmail.com','0123456789',NULL,'2025-10-26',1,0,0,3290000.00,3290000.00,0.00,3290000.00,NULL,NULL,'COMPLETED','PAID',NULL,NULL,NULL,'2025-10-18 05:06:10','2025-10-18 05:06:36','0123456789',0,NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cancellation_policies`
--

DROP TABLE IF EXISTS `cancellation_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancellation_policies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `policy_type` enum('STANDARD','FLEXIBLE','STRICT','CUSTOM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hours_before_departure_full_refund` int DEFAULT NULL,
  `hours_before_departure_partial_refund` int DEFAULT NULL,
  `hours_before_departure_no_refund` int DEFAULT NULL,
  `full_refund_percentage` decimal(5,2) DEFAULT '100.00',
  `partial_refund_percentage` decimal(5,2) DEFAULT '50.00',
  `no_refund_percentage` decimal(5,2) DEFAULT '0.00',
  `cancellation_fee` decimal(10,2) DEFAULT '0.00',
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `allows_medical_emergency_exception` tinyint(1) DEFAULT '0',
  `allows_weather_exception` tinyint(1) DEFAULT '0',
  `allows_force_majeure_exception` tinyint(1) DEFAULT '0',
  `minimum_notice_hours` int DEFAULT '1',
  `status` enum('ACTIVE','INACTIVE','DEPRECATED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `category_id` bigint DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `effective_from` datetime(6) DEFAULT NULL,
  `force_majeure_allowed` bit(1) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `medical_cancellation_allowed` bit(1) DEFAULT NULL,
  `processing_fee_percentage` decimal(5,2) DEFAULT NULL,
  `weather_cancellation_allowed` bit(1) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_policy_status` (`status`),
  KEY `idx_policy_type` (`policy_type`),
  KEY `idx_policy_category` (`category_id`),
  KEY `idx_policy_priority` (`priority`),
  KEY `FKqmsp5s6jq73lt3ae9m8mn13j8` (`created_by`),
  CONSTRAINT `cancellation_policies_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FKqmsp5s6jq73lt3ae9m8mn13j8` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancellation_policies`
--

LOCK TABLES `cancellation_policies` WRITE;
/*!40000 ALTER TABLE `cancellation_policies` DISABLE KEYS */;
INSERT INTO `cancellation_policies` VALUES (1,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:20:09','2025-09-30 14:23:51','2025-09-30 21:23:51.000000',NULL,NULL,NULL,NULL,NULL,1),(2,'Chính sách linh hoạt','Chính sách hủy tour linh hoạt với điều kiện dễ dàng hơn','FLEXIBLE',24,12,6,100.00,75.00,25.00,25000.00,15000.00,1,1,1,1,'ACTIVE',NULL,8,'2025-09-30 14:20:09','2025-09-30 14:23:51','2025-09-30 21:23:51.000000',NULL,NULL,NULL,NULL,NULL,1),(3,'Chính sách nghiêm ngặt','Chính sách hủy tour nghiêm ngặt cho các tour cao cấp','STRICT',72,48,24,90.00,30.00,0.00,100000.00,50000.00,0,0,1,2,'ACTIVE',NULL,9,'2025-09-30 14:20:09','2025-09-30 14:23:51','2025-09-30 21:23:51.000000',NULL,NULL,NULL,NULL,NULL,1),(4,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:23:51','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(5,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:23:51','2025-09-30 14:25:09','2025-09-30 21:25:09.000000',NULL,NULL,NULL,NULL,NULL,1),(6,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:23:51','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(7,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:25:09','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(8,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:25:09','2025-09-30 14:47:56','2025-09-30 21:47:56.000000',NULL,NULL,NULL,NULL,NULL,1),(9,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:25:09','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(10,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:47:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(11,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:47:56','2025-09-30 14:57:01','2025-09-30 21:57:01.000000',NULL,NULL,NULL,NULL,NULL,1),(12,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:47:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(13,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:57:01','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(14,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:57:01','2025-09-30 15:03:49','2025-09-30 22:03:49.000000',NULL,NULL,NULL,NULL,NULL,1),(15,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 14:57:01','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(16,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:03:49','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(17,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:03:49','2025-09-30 15:09:50','2025-09-30 22:09:50.000000',NULL,NULL,NULL,NULL,NULL,1),(18,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:03:49','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(19,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:09:50','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(20,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:09:50','2025-09-30 15:10:22','2025-09-30 22:10:22.000000',NULL,NULL,NULL,NULL,NULL,1),(21,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:09:50','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(22,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:22','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(23,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:22','2025-09-30 15:10:53','2025-09-30 22:10:53.000000',NULL,NULL,NULL,NULL,NULL,1),(24,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:22','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(25,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:53','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(26,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:53','2025-09-30 15:14:57','2025-09-30 22:14:57.000000',NULL,NULL,NULL,NULL,NULL,1),(27,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:10:53','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(28,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:14:57','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(29,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:14:57','2025-09-30 15:17:40','2025-09-30 22:17:40.000000',NULL,NULL,NULL,NULL,NULL,1),(30,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:14:57','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(31,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:17:40','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(32,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:17:40','2025-09-30 15:18:34','2025-09-30 22:18:34.000000',NULL,NULL,NULL,NULL,NULL,1),(33,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:17:40','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(34,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:18:34','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(35,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:18:34','2025-09-30 15:20:55','2025-09-30 22:20:55.000000',NULL,NULL,NULL,NULL,NULL,1),(36,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:18:34','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(37,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:20:55','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(38,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:20:55','2025-09-30 15:24:34','2025-09-30 22:24:34.000000',NULL,NULL,NULL,NULL,NULL,1),(39,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:20:55','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(40,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:24:34','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(41,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:24:34','2025-09-30 15:26:36','2025-09-30 22:26:36.000000',NULL,NULL,NULL,NULL,NULL,1),(42,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:24:35','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(43,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:26:36','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(44,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:26:36','2025-09-30 15:31:26','2025-09-30 22:31:26.000000',NULL,NULL,NULL,NULL,NULL,1),(45,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:26:36','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(46,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:31:26','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(47,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:31:26','2025-09-30 15:35:10','2025-09-30 22:35:10.000000',NULL,NULL,NULL,NULL,NULL,1),(48,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:31:26','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(49,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:35:10','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(50,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:35:10','2025-09-30 15:36:56','2025-09-30 22:36:56.000000',NULL,NULL,NULL,NULL,NULL,1),(51,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:35:10','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(52,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:36:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(53,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:36:56','2025-09-30 15:38:48','2025-09-30 22:38:48.000000',NULL,NULL,NULL,NULL,NULL,1),(54,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:36:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(55,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:38:48','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(56,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:38:48','2025-09-30 15:46:37','2025-09-30 22:46:37.000000',NULL,NULL,NULL,NULL,NULL,1),(57,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:38:48','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(58,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:46:37','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(59,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:46:37','2025-09-30 15:57:23','2025-09-30 22:57:23.000000',NULL,NULL,NULL,NULL,NULL,1),(60,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:46:37','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(61,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:57:23','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(62,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:57:23','2025-09-30 16:06:22','2025-09-30 23:06:22.000000',NULL,NULL,NULL,NULL,NULL,1),(63,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 15:57:23','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(64,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:06:22','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(65,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:06:22','2025-09-30 16:10:49','2025-09-30 23:10:49.000000',NULL,NULL,NULL,NULL,NULL,1),(66,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:06:22','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(67,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:10:49','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(68,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:10:49','2025-09-30 16:23:56','2025-09-30 23:23:56.000000',NULL,NULL,NULL,NULL,NULL,1),(69,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:10:49','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(70,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:23:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(71,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:23:56','2025-09-30 16:29:31','2025-09-30 23:29:31.000000',NULL,NULL,NULL,NULL,NULL,1),(72,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:23:56','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(73,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:29:31','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(74,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:29:31','2025-09-30 16:36:45','2025-09-30 23:36:45.000000',NULL,NULL,NULL,NULL,NULL,1),(75,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:29:31','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(76,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:36:45','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(77,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:36:45','2025-09-30 16:47:12','2025-09-30 23:47:12.000000',NULL,NULL,NULL,NULL,NULL,1),(78,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:36:45','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(79,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:47:12','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(80,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:47:12','2025-09-30 16:55:02','2025-09-30 23:55:02.000000',NULL,NULL,NULL,NULL,NULL,1),(81,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:47:12','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(82,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:55:02','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(83,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:55:02','2025-09-30 17:04:25','2025-10-01 00:04:25.000000',NULL,NULL,NULL,NULL,NULL,1),(84,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 16:55:02','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(85,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:04:25','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(86,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:04:25','2025-09-30 17:06:24','2025-10-01 00:06:24.000000',NULL,NULL,NULL,NULL,NULL,1),(87,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:04:25','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(88,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:06:24','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(89,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:06:24','2025-09-30 17:09:02','2025-10-01 00:09:02.000000',NULL,NULL,NULL,NULL,NULL,1),(90,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:06:24','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(91,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:09:02','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(92,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:09:02','2025-09-30 17:27:04','2025-10-01 00:27:04.000000',NULL,NULL,NULL,NULL,NULL,1),(93,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:09:02','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(94,'System Default Policy','Default cancellation policy for all tours','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:27:04','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1),(95,'Standard Policy','Chính sách hủy tiêu chuẩn cho tất cả tour','STANDARD',72,24,0,100.00,50.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:27:05','2025-09-30 17:27:05',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(96,'Updated Standard Policy','Updated policy with better refund rates','STANDARD',72,24,6,100.00,80.00,0.00,100000.00,50000.00,0,0,0,1,'ACTIVE',NULL,1,'2025-09-30 17:27:05','2025-09-30 17:27:05','2025-10-01 00:27:05.000000',NULL,_binary '',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `cancellation_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_parent_id` (`parent_id`),
  KEY `idx_categories_status` (`status`),
  KEY `idx_categories_display_order` (`display_order`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Du lịch biển đảo','du-lich-bien-dao','Tận hưởng không gian biển xanh cát trắng với những bãi biển đẹp nhất Việt Nam và thế giới','http://localhost:8080/uploads/c52abddc-54b7-4169-9dab-5432485ada19.jpg','?️',NULL,1,1,'ACTIVE','2025-09-30 14:19:08','2025-10-16 09:25:56'),(2,'Du lịch núi rừng','du-lich-nui-rung','Khám phá thiên nhiên hùng vĩ, chinh phục đỉnh núi và thác nước',NULL,'⛰️',NULL,2,1,'ACTIVE','2025-09-30 14:19:08','2025-10-15 19:56:17'),(3,'Du lịch văn hóa','du-lich-van-hoa','Tìm hiểu di sản văn hóa',NULL,'?️',NULL,3,1,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(4,'Du lịch tâm linh','du-lich-tam-linh','Hành trình tâm linh thanh tịnh đến các danh lam thắng cảnh',NULL,'?',NULL,4,0,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(5,'Du lịch nghỉ dưỡng','du-lich-nghi-duong','Thư giãn và chăm sóc sức khỏe tại các resort cao cấp',NULL,'?',NULL,5,1,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(6,'Du lịch khám phá','du-lich-kham-pha','Trải nghiệm và khám phá những điều mới lạ, độc đáo',NULL,'?',NULL,6,0,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(7,'Du lịch ẩm thực','du-lich-am-thuc','Thưởng thức đặc sản địa phương và khám phá văn hóa ẩm thực',NULL,'?',NULL,7,0,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(8,'Du lịch mạo hiểm','du-lich-mao-hiem','Thử thách bản thân với các hoạt động phiêu lưu mạo hiểm',NULL,'?',NULL,8,0,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(9,'Du lịch MICE','du-lich-mice','Hội nghị, sự kiện, team building và du lịch kết hợp công tác',NULL,'?',NULL,9,0,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(10,'Du lịch cao cấp','du-lich-cao-cap','Trải nghiệm sang trọng đẳng cấp với dịch vụ 5 sao',NULL,'?',NULL,10,1,'ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(11,'Du lịch biển','du-lich-bien','Các tour du lịch biển đảo tuyệt đẹp',NULL,NULL,NULL,0,0,'ACTIVE','2025-09-30 14:20:09','2025-10-15 16:15:11'),(12,'Du lịch núi','du-lich-nui','Khám phá vẻ đẹp của núi rừng',NULL,NULL,NULL,0,0,'ACTIVE','2025-09-30 14:20:09','2025-10-15 16:15:11'),(13,'Du lịch thành phố','du-lich-thanh-pho','Trải nghiệm văn hóa thành phố',NULL,NULL,NULL,0,0,'ACTIVE','2025-09-30 14:20:09','2025-10-15 16:15:11'),(14,'Du lịch phiêu lưu','du-lich-phieu-luu','Những chuyến phiêu lưu thú vị',NULL,NULL,NULL,0,0,'ACTIVE','2025-09-30 14:20:09','2025-10-15 19:56:29');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_requests`
--

DROP TABLE IF EXISTS `contact_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `tour_interest` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `assigned_to` bigint DEFAULT NULL,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_contact_status` (`status`),
  CONSTRAINT `contact_requests_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_requests`
--

LOCK TABLES `contact_requests` WRITE;
/*!40000 ALTER TABLE `contact_requests` DISABLE KEYS */;
INSERT INTO `contact_requests` VALUES (1,'Nguyễn Văn A','nguyenvana@gmail.com','0901234567','Hỏi về tour Sapa','Cho em hỏi tour Sapa đi vào tháng 12 có lạnh không ạ? Cần chuẩn bị gì?','Sapa - Fansipan - Cát Cát 2N3Đ','RESOLVED',NULL,NULL,'2025-09-15 03:30:00','2025-10-15 16:15:11'),(2,'Trần Thị B','tranthib@yahoo.com','0912345678','Đặt tour cho đoàn 15 người','Công ty em muốn đặt tour Đà Nẵng cho 15 người vào cuối tháng 10. Có ưu đãi gì không ạ?','Đà Nẵng - Hội An - Bà Nà 4N3Đ','IN_PROGRESS',NULL,NULL,'2025-09-20 07:20:00','2025-10-15 16:15:11'),(3,'Lê Văn C','levanc@outlook.com','0923456789','Giá tour Phú Quốc','Cho em xem bảng giá chi tiết tour Phú Quốc 4 ngày 3 đêm. Em muốn đi vào tháng 11.','Phú Quốc - Đảo Ngọc 4N3Đ','NEW',NULL,NULL,'2025-09-25 02:15:00','2025-10-15 16:15:11'),(4,'Phạm Thị D','phamthid@gmail.com','0934567890','Tour nước ngoài có cần visa không?','Anh chị cho em hỏi tour Tokyo có hỗ trợ làm visa không? Em chưa đi nước ngoài bao giờ.','Tokyo - Kyoto - Osaka 7N6Đ','RESOLVED',NULL,NULL,'2025-09-18 09:45:00','2025-10-15 16:15:11'),(5,'Hoàng Văn E','hoangvane@gmail.com','0945678901','Hủy tour có được hoàn tiền không?','Em đã đặt tour Nha Trang nhưng có việc gấp phải hủy. Chính sách hoàn tiền như thế nào ạ?','Nha Trang - Biển xanh 3N2Đ','IN_PROGRESS',NULL,NULL,'2025-09-22 04:30:00','2025-10-15 16:15:11'),(6,'Phạm Thị Mai','phammai@gmail.com','0905123456','Hỏi về tour Hạ Long','Em muốn đặt tour Hạ Long cho gia đình 4 người vào cuối tháng này. Tour có bao gồm ăn tối trên du thuyền không ạ? Chi phí khoảng bao nhiêu?','Hạ Long Bay - Du thuyền 5 sao 2N1Đ','NEW',NULL,NULL,'2025-10-06 01:30:00','2025-10-15 16:15:11'),(7,'Nguyễn Văn Khôi','khoi.nguyen@outlook.com','0912345678','Tour Sapa tháng 11','Anh cho em hỏi tháng 11 đi Sapa có tuyết rơi không? Em muốn book tour cho 2 người, có phòng đôi view núi không ạ?','Sapa - Fansipan - Cát Cát 3N2Đ','NEW',NULL,NULL,'2025-10-06 02:15:00','2025-10-15 16:15:11'),(8,'Lê Thị Hương','huongle@yahoo.com','0923456789','Yêu cầu báo giá tour Phú Quốc','Công ty em cần báo giá chi tiết cho đoàn 20 người đi Phú Quốc 4N3Đ. Khách sạn 4-5 sao, bao gồm vé máy bay từ Hà Nội. Vui lòng gửi báo giá qua email.','Phú Quốc - Đảo Ngọc 4N3Đ','NEW',NULL,NULL,'2025-10-06 03:00:00','2025-10-15 16:15:11'),(9,'Trần Minh Tuấn','tuantran@gmail.com','0934567890','Thủ tục visa Nhật Bản','Em định book tour Tokyo nhưng chưa có visa. Công ty có hỗ trợ làm visa không ạ? Thời gian xử lý bao lâu? Em cần chuẩn bị giấy tờ gì?','Tokyo - Phú Sĩ - Osaka 7N6Đ','NEW',NULL,NULL,'2025-10-06 04:20:00','2025-10-15 16:15:11'),(10,'Vũ Thị Lan','lanvu2024@gmail.com','0945678901','Tour Đà Lạt dịp lễ 30/4','Anh/chị cho em hỏi tour Đà Lạt dịp lễ 30/4 có chỗ trống không? Em muốn đi 3N2Đ cho 2 người. Giá tour bao nhiêu ạ?','Đà Lạt - Thành phố Ngàn Hoa 3N2Đ','NEW',NULL,NULL,'2025-10-06 06:45:00','2025-10-15 16:15:11'),(11,'Hoàng Minh Đức','duchoang@outlook.com','0956789012','Gia hạn visa Hàn Quốc','Em đã đặt tour Seoul nhưng visa sắp hết hạn. Có thể gia hạn hoặc làm visa mới không? Tour xuất phát sau 15 ngày nữa.','Seoul - Nami - Everland 5N4Đ','NEW',NULL,NULL,'2025-10-06 07:30:00','2025-10-15 16:15:11'),(12,'Đỗ Thị Ngọc','ngocdo@gmail.com','0967890123','Hỏi về bảo hiểm du lịch','Chị cho em hỏi tour Thái Lan có bao gồm bảo hiểm du lịch chưa ạ? Nếu chưa thì em có thể mua thêm không? Chi phí bao nhiêu?','Bangkok - Pattaya - Coral Island 4N3Đ','NEW',NULL,NULL,'2025-10-06 08:10:00','2025-10-15 20:15:19'),(13,'Bùi Văn Hùng','hungbui@gmail.com','0978901234','Thay đổi ngày khởi hành','Em đã đặt tour Nha Trang ngày 15/10 nhưng có việc đột xuất cần đổi sang ngày 20/10. Có được không ạ? Phí đổi lịch bao nhiêu?','Nha Trang - Vinpearl 3N2Đ','IN_PROGRESS',1,'Đang kiểm tra tình trạng tour ngày 20/10, sẽ phản hồi trong 24h.','2025-10-05 01:00:00','2025-10-15 16:15:11'),(14,'Nguyễn Thị Hà','hanguyen@yahoo.com','0989012345','Tour Maldives honeymoon','Vợ chồng em định đi Maldives tháng 12. Em muốn tư vấn resort 5 sao lãng mạn cho honeymoon, có spa và bữa tối riêng tư trên biển.','Maldives - Paradise Resort 6N5Đ','IN_PROGRESS',1,'Đã gửi 3 gợi ý resort, đang chờ khách lựa chọn.','2025-10-04 03:30:00','2025-10-15 16:15:11'),(15,'Lý Quang Minh','minhlq@gmail.com','0990123456','Đặt chỗ nhóm 30 người','Trường em tổ chức tour du lịch cho học sinh, khoảng 30 em cùng 5 giáo viên. Muốn đi Đà Nẵng 4N3Đ. Có ưu đãi cho đoàn không ạ?','Đà Nẵng - Hội An - Bà Nà 4N3Đ','IN_PROGRESS',1,'Đang làm báo giá cho đoàn 35 người, ưu đãi 15%.','2025-10-05 07:20:00','2025-10-15 16:15:11'),(16,'Trịnh Thị Thu','thutrinh@outlook.com','0901234561','Hủy tour và hoàn tiền','Em đã đặt tour Đà Lạt nhưng bị ốm nặng, bác sĩ khuyên không nên đi xa. Có thể hủy tour và được hoàn bao nhiêu % tiền?','Đà Lạt - Langbiang 3N2Đ','IN_PROGRESS',1,'Đang xem xét chứng nhận y tế, sẽ hoàn 70% theo chính sách.','2025-10-03 09:00:00','2025-10-15 16:15:11'),(17,'Phan Văn Thành','thanhphan@gmail.com','0912345662','Thêm dịch vụ đưa đón sân bay','Em đã book tour Phú Quốc nhưng quên không chọn dịch vụ đưa đón sân bay. Bây giờ có thể thêm không? Chi phí bao nhiêu ạ?','Phú Quốc - Grand World 4N3Đ','IN_PROGRESS',1,'Đã thêm dịch vụ pickup, phụ thu 500k/người. Đang chờ thanh toán.','2025-10-05 02:30:00','2025-10-15 16:15:11'),(18,'Võ Thị Kim','kimvo@yahoo.com','0923456763','Tour Singapore cho người lớn tuổi','Em muốn đặt tour Singapore cho bố mẹ (65 tuổi). Có tour nào nhẹ nhàng, không đi nhiều, phù hợp người lớn tuổi không ạ?','Singapore - Malaysia 5N4Đ','IN_PROGRESS',1,'Đã gợi ý tour senior-friendly, ít walking, có xe riêng.','2025-10-04 04:00:00','2025-10-15 16:15:11'),(19,'Đinh Văn Long','longdinh@gmail.com','0934567864','Xác nhận booking tour Hội An','Em đã chuyển khoản đặt cọc tour Hội An. Vui lòng xác nhận đã nhận tiền và gửi voucher cho em ạ.','Hội An - Cù Lao Chàm 3N2Đ','RESOLVED',1,'Đã xác nhận thanh toán và gửi voucher qua email. Case closed.','2025-10-02 01:00:00','2025-10-15 16:15:11'),(20,'Lâm Thị Mai','mailam@outlook.com','0945678965','Câu hỏi về chính sách trẻ em','Tour Vũng Tàu có giảm giá cho trẻ em không ạ? Con em 8 tuổi, có tính phí như người lớn không?','Vũng Tàu - Hồ Cốc 2N1Đ','RESOLVED',1,'Đã tư vấn: Trẻ 8 tuổi tính 70% giá người lớn. Khách đã đặt tour.','2025-10-01 03:30:00','2025-10-15 16:15:11'),(21,'Cao Văn Phúc','phuccao@gmail.com','0956789066','Gia hạn thời gian thanh toán','Em đã đặt tour Thái Lan nhưng chưa kịp chuyển tiền đúng hạn. Có thể gia hạn thêm 3 ngày được không ạ?','Bangkok - Phuket - Krabi 6N5Đ','RESOLVED',1,'Đã gia hạn đến 10/10. Khách đã thanh toán đầy đủ.','2025-09-28 02:00:00','2025-10-15 16:15:11'),(22,'Ngô Thị Hồng','hongngo@yahoo.com','0967890167','Yêu cầu phòng liền kề','Gia đình em đặt 2 phòng tour Đà Nẵng. Có thể sắp xếp 2 phòng cạnh nhau hoặc đối diện không ạ?','Đà Nẵng - Cù Lao Chàm 4N3Đ','RESOLVED',1,'Đã confirm với khách sạn, 2 phòng liền kề tầng 12. Khách hài lòng.','2025-09-29 07:00:00','2025-10-15 16:15:11'),(23,'Tô Văn Bình','binhto@gmail.com','0978901268','Hỏi về chương trình khuyến mãi','Em thấy có mã giảm giá SUMMER2024 nhưng khi nhập không được. Mã này còn hiệu lực không ạ?','Quy Nhơn - Kỳ Co 3N2Đ','RESOLVED',1,'Mã đã hết hạn 30/9. Đã áp dụng mã FALL2024 -10% cho khách.','2025-10-02 09:30:00','2025-10-15 16:15:11'),(24,'Dương Thị Lan','landuong@outlook.com','0989012369','Cảm ơn về chuyến đi tuyệt vời','Em vừa đi tour Sapa về, rất hài lòng với dịch vụ. HDV nhiệt tình, khách sạn đẹp, ăn uống ngon. Cảm ơn team rất nhiều!','Sapa - Fansipan - Bản Cát Cát 3N2Đ','CLOSED',NULL,'Feedback tích cực từ khách. Đã ghi nhận và cảm ơn.','2025-09-25 11:00:00','2025-10-15 16:15:11'),(25,'Hồ Văn Nam','namho@gmail.com','0990123470','Spam - Quảng cáo dịch vụ không liên quan','Công ty chúng tôi cung cấp dịch vụ marketing online, SEO, Facebook Ads. Liên hệ 09xxxx để được tư vấn miễn phí...',NULL,'CLOSED',1,'SPAM - Đã đánh dấu và đóng. Không phản hồi.','2025-10-05 13:00:00','2025-10-15 16:15:11'),(28,'test','test14112004@gmail.com','0123456789','aaaaaaaa','aaaaaaaaaaaaaaaa','Đà Lạt - Thành phố ngàn hoa 3N2Đ','NEW',NULL,NULL,'2025-10-17 09:36:13','2025-10-17 09:36:13'),(29,'Nguyen Manh Khoi','khoi14112004@gmail.com','0868541104','PARTNER_APPLICATION: Other','Công ty: Other\nLĩnh vực: Hotel\nĐịa điểm: Bắc Ninh\nWebsite: \n\nLời nhắn: ','Hotel','NEW',NULL,NULL,'2025-10-17 09:43:49','2025-10-17 09:43:49'),(30,'Nguyen Manh Khoi111','khoi14112004@gmail.com','0868541111','PARTNER_APPLICATION: Other111','Công ty: Other111\nLĩnh vực: Transport\nĐịa điểm: test 123\nWebsite: \n\nLời nhắn: ','Transport','NEW',NULL,NULL,'2025-10-17 09:44:37','2025-10-17 09:44:37');
/*!40000 ALTER TABLE `contact_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `continent` enum('AFRICA','AMERICA','ASIA','EUROPE','OCEANIA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flag_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `visa_required` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK5dhgnik9p8t72kaktdb8kd8dt` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=572 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'JP','ASIA',NULL,'JPY','https://flagcdn.com/jp.svg','Nhật Bản',NULL,_binary '\0'),(2,'KR','ASIA',NULL,'KRW','https://flagcdn.com/kr.svg','Hàn Quốc',NULL,_binary '\0'),(3,'TH','ASIA',NULL,'THB','https://flagcdn.com/th.svg','Thái Lan',NULL,_binary '\0'),(4,'SG','ASIA',NULL,'SGD','https://flagcdn.com/sg.svg','Singapore',NULL,_binary '\0'),(5,'MY','ASIA',NULL,'MYR','https://flagcdn.com/my.svg','Malaysia',NULL,_binary '\0'),(6,'ID','ASIA',NULL,'IDR','https://flagcdn.com/id.svg','Indonesia',NULL,_binary '\0'),(7,'CN','ASIA',NULL,'CNY','https://flagcdn.com/cn.svg','Trung Quốc',NULL,_binary ''),(8,'IN','ASIA',NULL,'INR','https://flagcdn.com/in.svg','Ấn Độ',NULL,_binary ''),(9,'FR','EUROPE',NULL,'EUR','https://flagcdn.com/fr.svg','Pháp',NULL,_binary ''),(10,'DE','EUROPE',NULL,'EUR','https://flagcdn.com/de.svg','Đức',NULL,_binary ''),(11,'IT','EUROPE',NULL,'EUR','https://flagcdn.com/it.svg','Ý',NULL,_binary ''),(12,'ES','EUROPE',NULL,'EUR','https://flagcdn.com/es.svg','Tây Ban Nha',NULL,_binary ''),(13,'GB','EUROPE',NULL,'GBP','https://flagcdn.com/gb.svg','Anh',NULL,_binary ''),(14,'CH','EUROPE',NULL,'CHF','https://flagcdn.com/ch.svg','Thụy Sĩ',NULL,_binary ''),(15,'US','AMERICA',NULL,'USD','https://flagcdn.com/us.svg','Mỹ',NULL,_binary ''),(16,'CA','AMERICA',NULL,'CAD','https://flagcdn.com/ca.svg','Canada',NULL,_binary ''),(17,'BR','AMERICA',NULL,'BRL','https://flagcdn.com/br.svg','Brazil',NULL,_binary ''),(18,'AU','OCEANIA',NULL,'AUD','https://flagcdn.com/au.svg','Úc',NULL,_binary ''),(19,'NZ','OCEANIA',NULL,'NZD','https://flagcdn.com/nz.svg','New Zealand',NULL,_binary '');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
INSERT INTO `email_verification_tokens` VALUES (5,'c5cac4ee-79cd-4831-b790-23263582b4b9',1202,'2025-10-17 15:57:09','2025-10-16 15:57:30','2025-10-16 15:57:09'),(6,'4cecb33a-768d-4400-9fb6-2b8cfccdc4fc',1203,'2025-10-17 16:00:32',NULL,'2025-10-16 16:00:32'),(7,'665c19b0-c0ad-4630-ac47-5bdf14bb245d',1204,'2025-10-18 13:49:58','2025-10-17 13:50:19','2025-10-17 13:49:58'),(8,'9e764211-1c08-401a-9434-ba6345c792f3',1205,'2025-10-19 10:41:04','2025-10-18 10:41:24','2025-10-18 10:41:04'),(9,'afa8ef02-70d5-429a-86a6-9bd7adaceefe',1206,'2025-10-19 11:59:09','2025-10-18 11:59:38','2025-10-18 11:59:09');
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_user_id` (`user_id`),
  KEY `idx_logs_entity` (`entity_type`,`entity_id`),
  KEY `idx_logs_created_at` (`created_at`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_config`
--

DROP TABLE IF EXISTS `loyalty_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Key cấu hình',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Giá trị cấu hình (JSON)',
  `config_type` enum('BONUS_RULE','EARNING_RATE','EXPIRY_RULE','GENERAL','LEVEL_THRESHOLD','REDEMPTION_RATE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mô tả',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Đang hoạt động',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_key` (`config_key`),
  KEY `idx_config_type` (`config_type`),
  KEY `idx_config_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng cấu hình hệ thống loyalty';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_config`
--

LOCK TABLES `loyalty_config` WRITE;
/*!40000 ALTER TABLE `loyalty_config` DISABLE KEYS */;
INSERT INTO `loyalty_config` VALUES (1,'booking_base_rate','0.01','EARNING_RATE','Tỷ lệ tích điểm cơ bản từ booking (1%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(2,'booking_domestic_rate','0.01','EARNING_RATE','Tỷ lệ tích điểm tour trong nước (1%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(3,'booking_international_rate','0.015','EARNING_RATE','Tỷ lệ tích điểm tour quốc tế (1.5%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(4,'first_booking_multiplier','2.0','BONUS_RULE','Nhân đôi điểm cho booking đầu tiên',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(5,'birthday_month_multiplier','1.5','BONUS_RULE','Tăng 50% điểm trong tháng sinh nhật',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(6,'review_basic_points','50','EARNING_RATE','Điểm cho review cơ bản',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(7,'review_with_photo_points','100','EARNING_RATE','Điểm cho review có ảnh',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(8,'review_detailed_points','150','EARNING_RATE','Điểm cho review chi tiết (>200 ký tự)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(9,'referral_referrer_points','200','EARNING_RATE','Điểm cho người giới thiệu',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(10,'referral_referee_points','100','EARNING_RATE','Điểm cho người được giới thiệu',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(11,'social_share_points','20','EARNING_RATE','Điểm cho chia sẻ social media',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(12,'birthday_bonus_points','500','BONUS_RULE','Điểm thưởng sinh nhật',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(13,'point_expiry_months','24','EXPIRY_RULE','Điểm hết hạn sau 24 tháng',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(14,'voucher_expiry_months','6','EXPIRY_RULE','Voucher hết hạn sau 6 tháng',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(15,'points_to_vnd_rate','50','REDEMPTION_RATE','1 điểm = 50 VND',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(16,'min_redeem_points','1000','REDEMPTION_RATE','Số điểm tối thiểu để đổi',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(17,'level_bronze_min','0','LEVEL_THRESHOLD','Điểm tối thiểu Bronze',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(18,'level_silver_min','1000','LEVEL_THRESHOLD','Điểm tối thiểu Silver',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(19,'level_gold_min','5000','LEVEL_THRESHOLD','Điểm tối thiểu Gold',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(20,'level_platinum_min','15000','LEVEL_THRESHOLD','Điểm tối thiểu Platinum',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(21,'level_diamond_min','50000','LEVEL_THRESHOLD','Điểm tối thiểu Diamond',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(22,'bronze_discount','0','LEVEL_THRESHOLD','Giảm giá Bronze (0%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(23,'silver_discount','0.02','LEVEL_THRESHOLD','Giảm giá Silver (2%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(24,'gold_discount','0.05','LEVEL_THRESHOLD','Giảm giá Gold (5%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(25,'platinum_discount','0.08','LEVEL_THRESHOLD','Giảm giá Platinum (8%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25'),(26,'diamond_discount','0.10','LEVEL_THRESHOLD','Giảm giá Diamond (10%)',1,'2025-10-18 09:51:25','2025-10-18 09:51:25');
/*!40000 ALTER TABLE `loyalty_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_level_history`
--

DROP TABLE IF EXISTS `loyalty_level_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_level_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `old_level` enum('BRONZE','DIAMOND','GOLD','PLATINUM','SILVER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_level` enum('BRONZE','DIAMOND','GOLD','PLATINUM','SILVER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points_at_change` int NOT NULL COMMENT 'Số điểm lúc đổi level',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_level_history_user` (`user_id`),
  KEY `idx_level_history_created` (`created_at`),
  CONSTRAINT `loyalty_level_history_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lịch sử thay đổi level';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_level_history`
--

LOCK TABLES `loyalty_level_history` WRITE;
/*!40000 ALTER TABLE `loyalty_level_history` DISABLE KEYS */;
INSERT INTO `loyalty_level_history` VALUES (1,1205,'BRONZE','DIAMOND',514350,'Đạt đủ điểm để nâng cấp','2025-10-18 04:39:00'),(2,1204,'BRONZE','PLATINUM',69800,'Đạt đủ điểm để nâng cấp','2025-10-18 04:57:27'),(3,1206,'BRONZE','GOLD',49800,'Đạt đủ điểm để nâng cấp','2025-10-18 05:01:37'),(4,1206,'GOLD','PLATINUM',51445,'Đạt đủ điểm để nâng cấp','2025-10-18 05:06:36');
/*!40000 ALTER TABLE `loyalty_level_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_points`
--

DROP TABLE IF EXISTS `loyalty_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `points_balance` int NOT NULL DEFAULT '0' COMMENT 'Số điểm hiện có',
  `total_earned` int NOT NULL DEFAULT '0' COMMENT 'Tổng điểm đã tích được',
  `total_redeemed` int NOT NULL DEFAULT '0' COMMENT 'Tổng điểm đã sử dụng',
  `total_expired` int NOT NULL DEFAULT '0' COMMENT 'Tổng điểm đã hết hạn',
  `level` enum('BRONZE','DIAMOND','GOLD','PLATINUM','SILVER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `level_updated_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian cập nhật level',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_loyalty` (`user_id`),
  KEY `idx_loyalty_level` (`level`),
  KEY `idx_loyalty_points_balance` (`points_balance`),
  CONSTRAINT `loyalty_points_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý điểm số và level của khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_points`
--

LOCK TABLES `loyalty_points` WRITE;
/*!40000 ALTER TABLE `loyalty_points` DISABLE KEYS */;
INSERT INTO `loyalty_points` VALUES (1,1205,771525,771525,0,0,'DIAMOND','2025-10-18 04:39:00','2025-10-18 10:41:04','2025-10-18 04:46:04'),(2,1204,69800,69800,0,0,'PLATINUM','2025-10-18 04:57:27','2025-10-18 04:57:27','2025-10-18 04:57:27'),(3,1206,51445,51445,0,0,'PLATINUM','2025-10-18 05:06:36','2025-10-18 11:59:09','2025-10-18 05:06:36');
/*!40000 ALTER TABLE `loyalty_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscribed_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `unsubscribed_at` datetime DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES (2,'dao0312@gmail.com','2025-10-19 09:04:04',1,NULL,'0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36');
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INFO','SUCCESS','WARNING','ERROR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ALL',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (7,NULL,'Cập nhật hệ thống','Hệ thống sẽ bảo trì vào 2h sáng ngày 15/10/2025. Thời gian dự kiến: 30 phút.','INFO',NULL,'ALL',0,'2025-10-07 01:00:00'),(8,NULL,'Khuyến mãi Black Friday','Chương trình giảm giá lớn Black Friday đang diễn ra! Giảm đến 30% cho tất cả các tour.','SUCCESS','/promotions','ALL',0,'2025-10-07 00:30:00'),(9,NULL,'Cảnh báo thời tiết','Bão số 5 đang tiến vào miền Trung. Các tour đến Đà Nẵng, Hội An có thể bị hoãn.','WARNING',NULL,'ALL',0,'2025-10-06 23:00:00'),(10,NULL,'Lỗi thanh toán','Hệ thống thanh toán MoMo đang gặp sự cố. Vui lòng sử dụng phương thức thanh toán khác.','ERROR',NULL,'ALL',1,'2025-10-06 07:20:00'),(17,NULL,'Tour mới','Tour \"Khám phá Tây Bắc 5N4Đ\" vừa được ra mắt với giá ưu đãi 7.990.000đ','INFO','/tours/new','ALL',0,'2025-10-03 01:00:00'),(18,NULL,'Chương trình khách hàng thân thiết','Tham gia ngay chương trình khách hàng thân thiết để nhận ưu đãi đặc biệt!','SUCCESS','/loyalty-program','ALL',1,'2025-10-02 03:00:00'),(19,NULL,'Thay đổi chính sách','Chính sách hủy tour đã được cập nhật. Xem chi tiết tại trang Điều khoản.','WARNING','/terms','ALL',1,'2025-10-01 07:00:00'),(25,NULL,'Tuyển dụng','Công ty đang tuyển dụng HDV cho các tour miền Bắc. Xem chi tiết tại trang Tuyển dụng.','SUCCESS',NULL,'ALL',0,'2025-10-07 02:30:00'),(43,999,'? Khuyến mãi mới!','Mã giảm giá \"PHUNUVN\" - Giảm 10đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:05:59'),(49,999,'? Khuyến mãi mới!','Mã giảm giá \"TEST123\" - Giảm 10đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:11:19'),(55,999,'? Test Notification','Đây là notification test để kiểm tra hệ thống.','INFO','/tours','User',1,'2025-10-11 06:17:52'),(56,999,'? Khuyến mãi mới!','Mã giảm giá \"PHUNUVN\" - Giảm 10đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:22:25'),(62,999,'? Khuyến mãi mới!','Mã giảm giá \"TEST123465\" - Giảm 10đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:33:58'),(63,999,'? Khuyến mãi mới!','Mã giảm giá \"ABCDEF\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:34:46'),(64,999,'? Khuyến mãi mới!','Mã giảm giá \"TANGKHOI\" - Giảm 20%. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:53:41'),(65,1196,'? Khuyến mãi mới!','Mã giảm giá \"TANGKHOI\" - Giảm 20%. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-10 23:53:41'),(66,999,'? Tour mới ra mắt!','Tour \"test 123 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123',NULL,1,'2025-10-11 00:13:29'),(67,1196,'? Tour mới ra mắt!','Tour \"test 123 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123',NULL,1,'2025-10-11 00:13:29'),(68,999,'? Tour mới ra mắt!','Tour \"Nguyen Manh Khoi\" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/nguyen-manh-khoi',NULL,1,'2025-10-11 00:24:17'),(69,1196,'? Tour mới ra mắt!','Tour \"Nguyen Manh Khoi\" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/nguyen-manh-khoi',NULL,1,'2025-10-11 00:24:17'),(70,1196,'Đặt tour thành công','Bạn đã đặt tour \'Đà Nẵng - Hội An - Bà Nà 4N3Đ\' thành công! Mã đặt tour: BK44067844344. Vui lòng thanh toán trước 20/10/2025.','SUCCESS','/bookings/18',NULL,1,'2025-10-13 01:27:48'),(71,1196,'Đặt tour thành công','Bạn đã đặt tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' thành công! Mã đặt tour: BK44259229983. Vui lòng thanh toán trước 24/10/2025.','SUCCESS','/bookings/19',NULL,1,'2025-10-13 01:30:59'),(72,1,'Đặt tour thành công','Bạn đã đặt tour \'Huế - Động Phong Nha 3N2Đ\' thành công! Mã đặt tour: BK64440782268. Vui lòng thanh toán trước 19/10/2025.','SUCCESS','/bookings/20',NULL,1,'2025-10-13 07:07:21'),(73,1,'Đặt tour thành công','Bạn đã đặt tour \'Huế - Động Phong Nha 3N2Đ\' thành công! Mã đặt tour: BK645351021. Vui lòng thanh toán trước 23/11/2025.','SUCCESS','/bookings/21',NULL,1,'2025-10-13 07:08:55'),(74,1196,'Đặt tour thành công','Bạn đã đặt tour \'Tây Nguyên - Buôn Ma Thuột 4N3Đ\' thành công! Mã đặt tour: BK12398683497. Vui lòng thanh toán trước 18/11/2025.','SUCCESS','/bookings/22',NULL,1,'2025-10-15 00:13:19'),(75,1196,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK12702885111. Vui lòng thanh toán trước 19/10/2025.','SUCCESS','/bookings/23',NULL,1,'2025-10-15 00:18:23'),(76,1196,'Đặt tour thành công','Bạn đã đặt tour \'Seoul - Nami - Everland 5N4Đ\' thành công! Mã đặt tour: BK12877915413. Vui lòng thanh toán trước 21/10/2025.','SUCCESS','/bookings/24',NULL,1,'2025-10-15 00:21:18'),(77,1196,'Đặt tour thành công','Bạn đã đặt tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' thành công! Mã đặt tour: BK13142955535. Vui lòng thanh toán trước 31/10/2025.','SUCCESS','/bookings/25',NULL,1,'2025-10-15 00:25:43'),(78,1196,'Đặt tour thành công','Bạn đã đặt tour \'Cần Thơ - Miền Tây sông nước 3N2Đ\' thành công! Mã đặt tour: BK13403280794. Vui lòng thanh toán trước 20/10/2025.','SUCCESS','/bookings/26',NULL,1,'2025-10-15 00:30:03'),(79,1196,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK13492269766. Vui lòng thanh toán trước 19/10/2025.','SUCCESS','/bookings/27',NULL,1,'2025-10-15 00:31:32'),(80,1197,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK16607260514. Vui lòng thanh toán trước 19/10/2025.','SUCCESS','/bookings/28',NULL,1,'2025-10-15 01:23:27'),(81,1197,'Đặt tour thành công','Bạn đã đặt tour \'Tây Bắc - Điện Biên - Mộc Châu 5N4Đ\' thành công! Mã đặt tour: BK41213247474. Vui lòng thanh toán trước 22/10/2025.','SUCCESS','/bookings/29',NULL,0,'2025-10-15 08:13:33'),(82,1202,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK31079952964. Vui lòng thanh toán trước 26/10/2025.','SUCCESS','/bookings/30',NULL,1,'2025-10-16 09:11:20'),(83,1,'? Yêu cầu hủy tour mới','Khách hàng \'Dao\' yêu cầu hủy tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' (Booking: BK31079952964). Lý do: Thay đổi lịch trình cá nhân. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,1,'2025-10-16 09:13:51'),(84,2,'? Yêu cầu hủy tour mới','Khách hàng \'Dao\' yêu cầu hủy tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' (Booking: BK31079952964). Lý do: Thay đổi lịch trình cá nhân. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,0,'2025-10-16 09:13:51'),(85,1202,'Đặt tour thành công','Bạn đã đặt tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' thành công! Mã đặt tour: BK31285997186. Vui lòng thanh toán trước 24/10/2025.','SUCCESS','/bookings/31',NULL,1,'2025-10-16 09:14:46'),(86,999,'? Tour mới ra mắt!','Tour \"test 123 456 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123-456',NULL,0,'2025-10-16 09:24:09'),(87,1196,'? Tour mới ra mắt!','Tour \"test 123 456 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123-456',NULL,1,'2025-10-16 09:24:09'),(88,1197,'? Tour mới ra mắt!','Tour \"test 123 456 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123-456',NULL,0,'2025-10-16 09:24:09'),(89,1202,'? Tour mới ra mắt!','Tour \"test 123 456 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123-456',NULL,1,'2025-10-16 09:24:09'),(90,1203,'? Tour mới ra mắt!','Tour \"test 123 456 \" vừa được thêm vào hệ thống. Khám phá ngay!','INFO','/tours/test-123-456',NULL,0,'2025-10-16 09:24:09'),(91,1202,'✅ Yêu cầu hủy tour đã được phê duyệt','Yêu cầu hủy tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' (Mã booking: BK31079952964) đã được phê duyệt. Số tiền hoàn lại: 5,900,700 đ. Chúng tôi sẽ xử lý hoàn tiền trong vòng 5-7 ngày làm việc.','SUCCESS','/dashboard/cancellations',NULL,1,'2025-10-16 09:26:31'),(92,1202,'? Hoàn tiền thành công','Số tiền 5,900,700 đ từ tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' (Mã booking: BK31079952964) đã được hoàn lại vào tài khoản của bạn. Vui lòng kiểm tra tài khoản ngân hàng.','SUCCESS','/dashboard/bookings',NULL,1,'2025-10-16 09:27:25'),(93,999,'? Khuyến mãi mới!','Mã giảm giá \"IDA7GID1\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,0,'2025-10-16 09:33:10'),(94,1196,'? Khuyến mãi mới!','Mã giảm giá \"IDA7GID1\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-16 09:33:10'),(95,1197,'? Khuyến mãi mới!','Mã giảm giá \"IDA7GID1\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,0,'2025-10-16 09:33:10'),(96,1202,'? Khuyến mãi mới!','Mã giảm giá \"IDA7GID1\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,1,'2025-10-16 09:33:10'),(97,1203,'? Khuyến mãi mới!','Mã giảm giá \"IDA7GID1\" - Giảm 100000đ. Áp dụng ngay!','INFO','/tours',NULL,0,'2025-10-16 09:33:10'),(98,1202,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK07415737498. Vui lòng thanh toán trước 02/11/2025.','SUCCESS','/bookings/32',NULL,0,'2025-10-17 06:23:36'),(99,1204,'Đặt tour thành công','Bạn đã đặt tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' thành công! Mã đặt tour: BK10154363208. Vui lòng thanh toán trước 24/10/2025.','SUCCESS','/bookings/33',NULL,1,'2025-10-17 07:09:14'),(100,1,'? Yêu cầu hủy tour mới','Khách hàng \'nmk\' yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Booking: BK10154363208). Lý do: aaaaaaaaaaaaa. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,1,'2025-10-17 07:10:33'),(101,2,'? Yêu cầu hủy tour mới','Khách hàng \'nmk\' yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Booking: BK10154363208). Lý do: aaaaaaaaaaaaa. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,0,'2025-10-17 07:10:33'),(102,1204,'❌ Yêu cầu hủy tour bị từ chối','Yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Mã booking: BK10154363208) đã bị từ chối. Booking của bạn vẫn còn hiệu lực. Lý do: no','WARNING','/dashboard/bookings',NULL,1,'2025-10-17 07:10:56'),(103,1,'? Yêu cầu hủy tour mới','Khách hàng \'nmk\' yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Booking: BK10154363208). Lý do: 11111111111. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,1,'2025-10-17 07:11:15'),(104,2,'? Yêu cầu hủy tour mới','Khách hàng \'nmk\' yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Booking: BK10154363208). Lý do: 11111111111. Vui lòng xử lý trong vòng 24h.','WARNING','/admin/cancellations',NULL,0,'2025-10-17 07:11:15'),(105,1204,'✅ Yêu cầu hủy tour đã được phê duyệt','Yêu cầu hủy tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Mã booking: BK10154363208) đã được phê duyệt. Số tiền hoàn lại: 1,551,000 đ. Chúng tôi sẽ xử lý hoàn tiền trong vòng 5-7 ngày làm việc.','SUCCESS','/dashboard/cancellations',NULL,1,'2025-10-17 07:11:28'),(106,1204,'? Hoàn tiền thành công','Số tiền 1,551,000 đ từ tour \'Sapa - Fansipan - Cát Cát 2N3Đ\' (Mã booking: BK10154363208) đã được hoàn lại vào tài khoản của bạn. Vui lòng kiểm tra tài khoản ngân hàng.','SUCCESS','/dashboard/bookings',NULL,1,'2025-10-17 07:11:37'),(107,1204,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK1465921827. Vui lòng thanh toán trước 26/10/2025.','SUCCESS','/bookings/34',NULL,1,'2025-10-17 08:24:19'),(108,1204,'Đặt tour thành công','Bạn đã đặt tour \'Đà Lạt - Thành phố ngàn hoa 3N2Đ\' thành công! Mã đặt tour: BK15078048845. Vui lòng thanh toán trước 03/11/2025.','SUCCESS','/bookings/35',NULL,1,'2025-10-17 08:31:18'),(143,1204,'Quản trị viên đã phản hồi','Quản trị viên đã phản hồi đánh giá của bạn về tour \'Đà Lạt - Thành phố ngàn hoa 3N2Đ\'. Xem ngay!','INFO','/tours/3/reviews',NULL,1,'2025-10-17 20:32:17'),(144,1205,'Đặt tour thành công','Bạn đã đặt tour \'Seoul - Nami - Everland 5N4Đ\' thành công! Mã đặt tour: BK86864912972. Vui lòng thanh toán trước 28/10/2025.','SUCCESS','/bookings/36',NULL,0,'2025-10-18 04:27:45'),(145,1204,'Đặt tour thành công','Bạn đã đặt tour \'Đà Nẵng - Hội An - Bà Nà 4N3Đ\' thành công! Mã đặt tour: BK88605448543. Vui lòng thanh toán trước 27/10/2025.','SUCCESS','/bookings/37',NULL,0,'2025-10-18 04:56:45'),(146,1206,'Đặt tour thành công','Bạn đã đặt tour \'Hà Nội - Hạ Long - Ninh Bình 3N2Đ\' thành công! Mã đặt tour: BK88806168902. Vui lòng thanh toán trước 26/10/2025.','SUCCESS','/bookings/38',NULL,1,'2025-10-18 05:00:06'),(147,1206,'Đặt tour thành công','Bạn đã đặt tour \'Huế - Động Phong Nha 3N2Đ\' thành công! Mã đặt tour: BK89170116413. Vui lòng thanh toán trước 26/10/2025.','SUCCESS','/bookings/39',NULL,1,'2025-10-18 05:06:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partner_images`
--

DROP TABLE IF EXISTS `partner_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partner_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `image_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partner_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2xn8eydwyaa8rsro4ufi52u3v` (`partner_id`),
  CONSTRAINT `FK2xn8eydwyaa8rsro4ufi52u3v` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner_images`
--

LOCK TABLES `partner_images` WRITE;
/*!40000 ALTER TABLE `partner_images` DISABLE KEYS */;
INSERT INTO `partner_images` VALUES (1,'Sofitel Legend Metropole Hanoi - Exterior',0,'cover','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',1),(2,'Sofitel Legend Metropole Hanoi - Logo',0,'logo','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',1),(3,'Sofitel Legend Metropole Hanoi - Pool',1,'gallery','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',1),(4,'Sofitel Legend Metropole Hanoi - Room',2,'gallery','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',1),(5,'JW Marriott Hotel Hanoi - Exterior',0,'cover','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',2),(6,'JW Marriott Hotel Hanoi - Logo',0,'logo','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',2),(7,'Park Hyatt Saigon - Exterior',0,'cover','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',6),(8,'Park Hyatt Saigon - Logo',0,'logo','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',6),(9,'InterContinental Danang - Beach View',0,'cover','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',11),(10,'InterContinental Danang - Logo',0,'logo','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400',11),(11,'JW Marriott Phu Quoc - Aerial View',0,'cover','https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1200',16),(12,'JW Marriott Phu Quoc - Logo',0,'logo','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',16),(13,'Khách sạn Đại Dương - View tổng thể',0,'cover','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',1),(14,'Logo Khách sạn Đại Dương',0,'logo','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',1),(15,'Lobby sang trọng',1,'gallery','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',1),(16,'Phòng Superior view biển',2,'gallery','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',1),(17,'Hồ bơi infinity',3,'gallery','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',1),(18,'Nhà hàng view biển',4,'gallery','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600',1),(19,'Saigon Tourist - Văn phòng trung tâm',0,'cover','https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800',2),(20,'Logo Saigon Tourist',0,'logo','https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',2),(21,'Tour Hạ Long Bay',1,'gallery','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',2),(22,'Tour Sapa',2,'gallery','https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',2),(23,'Tour Phú Quốc',3,'gallery','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',2),(24,'Tour Đà Nẵng',4,'gallery','https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',2),(25,'Vietravel - Trụ sở chính',0,'cover','https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',3),(26,'Logo Vietravel',0,'logo','https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',3),(27,'Tour Hội An',1,'gallery','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',3),(28,'Tour Mũi Né',2,'gallery','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',3),(29,'Tour Cần Thơ',3,'gallery','https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600',3),(30,'Resort Paradise - Tổng quan resort',0,'cover','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',4),(31,'Logo Resort Paradise',0,'logo','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',4),(32,'Bãi biển riêng',1,'gallery','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600',4),(33,'Villa view biển',2,'gallery','https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',4),(34,'Spa & Wellness',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',4),(35,'Watersport activities',4,'gallery','https://images.unsplash.com/photo-1544966503-7cc61b31fc34?w=600',4),(36,'TNK Travel - Adventure tours',0,'cover','https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',5),(37,'Logo TNK Travel',0,'logo','https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400',5),(38,'Trekking Sapa',1,'gallery','https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600',5),(39,'Motorbiking tours',2,'gallery','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',5),(40,'Kayaking adventures',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',5),(41,'Khách sạn Đại Dương - View tổng thể',0,'cover','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',1),(42,'Logo Khách sạn Đại Dương',0,'logo','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',1),(43,'Lobby sang trọng',1,'gallery','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',1),(44,'Phòng Superior view biển',2,'gallery','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',1),(45,'Hồ bơi infinity',3,'gallery','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',1),(46,'Nhà hàng view biển',4,'gallery','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600',1),(47,'Saigon Tourist - Văn phòng trung tâm',0,'cover','https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800',2),(48,'Logo Saigon Tourist',0,'logo','https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',2),(49,'Tour Hạ Long Bay',1,'gallery','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',2),(50,'Tour Sapa',2,'gallery','https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',2),(51,'Tour Phú Quốc',3,'gallery','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',2),(52,'Tour Đà Nẵng',4,'gallery','https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',2),(53,'Vietravel - Trụ sở chính',0,'cover','https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',3),(54,'Logo Vietravel',0,'logo','https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',3),(55,'Tour Hội An',1,'gallery','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',3),(56,'Tour Mũi Né',2,'gallery','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',3),(57,'Tour Cần Thơ',3,'gallery','https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600',3),(58,'Resort Paradise - Tổng quan resort',0,'cover','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',4),(59,'Logo Resort Paradise',0,'logo','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',4),(60,'Bãi biển riêng',1,'gallery','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600',4),(61,'Villa view biển',2,'gallery','https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',4),(62,'Spa & Wellness',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',4),(63,'Watersport activities',4,'gallery','https://images.unsplash.com/photo-1544966503-7cc61b31fc34?w=600',4),(64,'TNK Travel - Adventure tours',0,'cover','https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',5),(65,'Logo TNK Travel',0,'logo','https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400',5),(66,'Trekking Sapa',1,'gallery','https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600',5),(67,'Motorbiking tours',2,'gallery','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',5),(68,'Kayaking adventures',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',5),(69,'Khách sạn Đại Dương - View tổng thể',0,'cover','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',1),(70,'Logo Khách sạn Đại Dương',0,'logo','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',1),(71,'Lobby sang trọng',1,'gallery','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',1),(72,'Phòng Superior view biển',2,'gallery','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',1),(73,'Hồ bơi infinity',3,'gallery','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',1),(74,'Nhà hàng view biển',4,'gallery','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600',1),(75,'Saigon Tourist - Văn phòng trung tâm',0,'cover','https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800',2),(76,'Logo Saigon Tourist',0,'logo','https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',2),(77,'Tour Hạ Long Bay',1,'gallery','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',2),(78,'Tour Sapa',2,'gallery','https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',2),(79,'Tour Phú Quốc',3,'gallery','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',2),(80,'Tour Đà Nẵng',4,'gallery','https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',2),(81,'Vietravel - Trụ sở chính',0,'cover','https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',3),(82,'Logo Vietravel',0,'logo','https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',3),(83,'Tour Hội An',1,'gallery','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',3),(84,'Tour Mũi Né',2,'gallery','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',3),(85,'Tour Cần Thơ',3,'gallery','https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600',3),(86,'Resort Paradise - Tổng quan resort',0,'cover','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',4),(87,'Logo Resort Paradise',0,'logo','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',4),(88,'Bãi biển riêng',1,'gallery','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600',4),(89,'Villa view biển',2,'gallery','https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',4),(90,'Spa & Wellness',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',4),(91,'Watersport activities',4,'gallery','https://images.unsplash.com/photo-1544966503-7cc61b31fc34?w=600',4),(92,'TNK Travel - Adventure tours',0,'cover','https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',5),(93,'Logo TNK Travel',0,'logo','https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400',5),(94,'Trekking Sapa',1,'gallery','https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600',5),(95,'Motorbiking tours',2,'gallery','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',5),(96,'Kayaking adventures',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',5),(97,'Khách sạn Đại Dương - View tổng thể',0,'cover','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',1),(98,'Logo Khách sạn Đại Dương',0,'logo','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',1),(99,'Lobby sang trọng',1,'gallery','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',1),(100,'Phòng Superior view biển',2,'gallery','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',1),(101,'Hồ bơi infinity',3,'gallery','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',1),(102,'Nhà hàng view biển',4,'gallery','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600',1),(103,'Saigon Tourist - Văn phòng trung tâm',0,'cover','https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800',2),(104,'Logo Saigon Tourist',0,'logo','https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',2),(105,'Tour Hạ Long Bay',1,'gallery','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',2),(106,'Tour Sapa',2,'gallery','https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',2),(107,'Tour Phú Quốc',3,'gallery','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',2),(108,'Tour Đà Nẵng',4,'gallery','https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',2),(109,'Vietravel - Trụ sở chính',0,'cover','https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',3),(110,'Logo Vietravel',0,'logo','https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',3),(111,'Tour Hội An',1,'gallery','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',3),(112,'Tour Mũi Né',2,'gallery','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',3),(113,'Tour Cần Thơ',3,'gallery','https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600',3),(114,'Resort Paradise - Tổng quan resort',0,'cover','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',4),(115,'Logo Resort Paradise',0,'logo','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',4),(116,'Bãi biển riêng',1,'gallery','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600',4),(117,'Villa view biển',2,'gallery','https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',4),(118,'Spa & Wellness',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',4),(119,'Watersport activities',4,'gallery','https://images.unsplash.com/photo-1544966503-7cc61b31fc34?w=600',4),(120,'TNK Travel - Adventure tours',0,'cover','https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',5),(121,'Logo TNK Travel',0,'logo','https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400',5),(122,'Trekking Sapa',1,'gallery','https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600',5),(123,'Motorbiking tours',2,'gallery','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',5),(124,'Kayaking adventures',3,'gallery','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',5);
/*!40000 ALTER TABLE `partner_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('HOTEL','RESTAURANT','TRANSPORT','TOUR_OPERATOR','INSURANCE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `rating` double DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `established_year` int DEFAULT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialties` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_partners_type` (`type`),
  KEY `idx_partners_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
INSERT INTO `partners` VALUES (1,'Sofitel Legend Metropole Hanoi','HOTEL','15 Ngô Quyền, Hoàn Kiếm, Hà Nội','024-3826-6919','info@sofitel-hanoi.com','https://sofitel-hanoi.com','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400','Khách sạn sang trọng 5 sao nằm trong trung tâm Hà Nội, được xây dựng từ năm 1901 với kiến trúc thuộc địa Pháp đẳng cấp. Khách sạn mang đến trải nghiệm nghỉ dưỡng cao cấp với dịch vụ hoàn hảo.',4.9,'ACTIVE','2025-09-30 17:03:45','2025-10-16 09:33:57',1901,'sofitel-legend-metropole-hanoi','[\"Khách sạn 5 sao\", \"Lịch sử lâu đời\", \"Spa cao cấp\", \"Nhà hàng Michelin\", \"Gần Hồ Hoàn Kiếm\"]'),(2,'JW Marriott Hotel Hanoi','HOTEL','8 Đỗ Đức Dục, Mễ Trì, Nam Từ Liêm, Hà Nội','024-3833-5588','reservation.hanoi@marriott.com','https://jwmarriott-hanoi.com','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400','Khách sạn 5 sao hiện đại tọa lạc tại khu vực trung tâm Hà Nội, cung cấp phòng nghỉ sang trọng, hồ bơi ngoài trời, spa, và nhiều lựa chọn ẩm thực đa dạng.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2013,'jw-marriott-hanoi','[\"Khách sạn 5 sao\", \"Hồ bơi ngoài trời\", \"Spa & Fitness\", \"Phòng họp cao cấp\", \"Gần sân bay\"]'),(3,'Pan Pacific Hanoi','HOTEL','1 Thanh Niên, Ba Đình, Hà Nội','024-3823-8888','info.hanoi@panpacific.com','https://panpacific.com/hanoi','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400','Khách sạn 5 sao với thiết kế hiện đại, nằm ở vị trí đắc địa trên đường Thanh Niên, view Hồ Tây tuyệt đẹp. Dịch vụ tận tâm và chuyên nghiệp.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2015,'pan-pacific-hanoi','[\"Khách sạn 5 sao\", \"View Hồ Tây\", \"Buffet quốc tế\", \"Phòng Deluxe rộng rãi\", \"Club Lounge\"]'),(4,'Hilton Hanoi Opera','HOTEL','1 Lê Thánh Tông, Hoàn Kiếm, Hà Nội','024-3933-0500','reservations.hanoiopera@hilton.com','https://hilton.com/hanoi','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400','Khách sạn 5 sao nằm đối diện Nhà hát Lớn Hà Nội, gần Hồ Hoàn Kiếm. Thiết kế kết hợp giữa phong cách cổ điển và hiện đại, phục vụ khách du lịch và doanh nhân.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',1999,'hilton-hanoi-opera','[\"Khách sạn 5 sao\", \"Vị trí trung tâm\", \"Nhà hàng Ý\", \"Hồ bơi trong nhà\", \"Gần phố cổ\"]'),(5,'Hanoi La Siesta Hotel & Spa','HOTEL','94 Mã Mây, Hoàn Kiếm, Hà Nội','024-3926-3641','reservation@hanoilasiesta.com','https://hanoilasiesta.com','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400','Khách sạn boutique 4 sao nằm giữa lòng phố cổ Hà Nội, mang đến không gian ấm cúng, thân thiện với dịch vụ spa miễn phí và ẩm thực đặc sắc.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2012,'hanoi-la-siesta-hotel-spa','[\"Khách sạn 4 sao\", \"Spa miễn phí\", \"Buffet sáng ngon\", \"Nhân viên thân thiện\", \"Giữa phố cổ\"]'),(6,'Park Hyatt Saigon','HOTEL','2 Lam Sơn, Quận 1, TP.HCM','028-3824-1234','saigon.park@hyatt.com','https://parkhyattsaigon.com','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400','Khách sạn 5 sao xa hoa bậc nhất tại trung tâm Sài Gòn, nằm trên đường Lam Sơn, gần Nhà hát Thành phố. Thiết kế sang trọng với phong cách Đông Dương đương đại.',4.9,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2005,'park-hyatt-saigon','[\"Khách sạn 5 sao\", \"Thiết kế Đông Dương\", \"Spa Xuan\", \"Bar Opera rooftop\", \"Gần Nhà hát\"]'),(7,'Hotel des Arts Saigon','HOTEL','76-78 Nguyễn Thị Minh Khai, Quận 3, TP.HCM','028-3989-8888','reservation@hoteldesarts.com.vn','https://hoteldesarts.com.vn','https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400','Khách sạn nghệ thuật 5 sao độc đáo với từng tầng được thiết kế theo phong cách nghệ sĩ nổi tiếng. Rooftop bar view toàn cảnh thành phố.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2013,'hotel-des-arts-saigon','[\"Khách sạn 5 sao\", \"Nghệ thuật độc đáo\", \"Rooftop bar\", \"Hồ bơi vô cực\", \"Gần Bến Thành\"]'),(8,'Renaissance Riverside Hotel Saigon','HOTEL','8-15 Tôn Đức Thắng, Quận 1, TP.HCM','028-3822-0033','reservation.riverside@marriott.com','https://renaissance-saigon.com','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400','Khách sạn 5 sao ven sông Sài Gòn với view tuyệt đẹp, gần chợ Bến Thành và phố đi bộ Nguyễn Huệ. Phòng ốc hiện đại, dịch vụ chuyên nghiệp.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',1999,'renaissance-riverside-saigon','[\"Khách sạn 5 sao\", \"View sông Sài Gòn\", \"Hồ bơi ngoài trời\", \"Gần chợ Bến Thành\", \"Club Lounge\"]'),(9,'Vinpearl Luxury Landmark 81','HOTEL','720A Đường Điện Biên Phủ, Bình Thạnh, TP.HCM','028-3948-8888','info.landmark81@vinpearl.com','https://vinpearl.com/landmark81','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400','Khách sạn 5 sao cao nhất Việt Nam nằm trong tòa nhà Landmark 81, mang đến trải nghiệm nghỉ dưỡng đẳng cấp quốc tế với view toàn cảnh thành phố.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2018,'vinpearl-luxury-landmark-81','[\"Khách sạn 5 sao\", \"Cao nhất VN\", \"Spa cao cấp\", \"View 360°\", \"SkyBar độc đáo\"]'),(10,'Liberty Central Saigon Citypoint','HOTEL','59-61 Pasteur, Quận 1, TP.HCM','028-3822-5678','reservation@libertycentral.com.vn','https://libertycentral.com.vn','https://images.unsplash.com/photo-1549294413-26f195200c16?w=400','Khách sạn 4 sao hiện đại nằm trên đường Võ Văn Kiệt với view sông đẹp, phòng rộng rãi, rooftop pool bar và nhà hàng buffet đa dạng.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2010,'liberty-central-saigon-citypoint','[\"Khách sạn 4 sao\", \"Rooftop pool\", \"Buffet sáng phong phú\", \"Gần chợ Bến Thành\", \"Giá hợp lý\"]'),(11,'InterContinental Danang Sun Peninsula Resort','HOTEL','Bãi Bắc, Sơn Trà, Đà Nẵng','0236-3938-888','reservation.danang@ihg.com','https://danang.intercontinental.com','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400','Resort 5 sao sang trọng trên bán đảo Sơn Trà với thiết kế độc đáo của kiến trúc sư Bill Bensley, view biển tuyệt đẹp và dịch vụ đẳng cấp quốc tế.',5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2012,'intercontinental-danang-sun-peninsula','[\"Resort 5 sao\", \"Thiết kế độc đáo\", \"View biển tuyệt đẹp\", \"Spa La Maison\", \"Bãi biển riêng\"]'),(12,'Furama Resort Danang','HOTEL','68 Hồ Xuân Hương, Bãi Biển Mỹ Khê, Đà Nẵng','0236-3847-333','reservation@furamavietnam.com','https://furamavietnam.com','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400','Resort 5 sao bãi biển nổi tiếng tại Đà Nẵng với 198 phòng và villa, hồ bơi rộng lớn, 4 nhà hàng và quầy bar, phù hợp cho gia đình và hội nghị.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',1997,'furama-resort-danang','[\"Resort 5 sao\", \"Bãi biển Mỹ Khê\", \"4 nhà hàng\", \"Kids club\", \"Hồ bơi lớn\"]'),(13,'Pullman Danang Beach Resort','HOTEL','101 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng','0236-3958-888','reservation@pullman-danang.com','https://pullman-danang.com','https://images.unsplash.com/photo-1559508551-44bff1de756b?w=400','Resort 5 sao tọa lạc ngay trên bãi biển Non Nước với 209 phòng và villa, thiết kế hiện đại, hồ bơi vô cực và nhiều hoạt động giải trí.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2013,'pullman-danang-beach-resort','[\"Resort 5 sao\", \"Bãi biển Non Nước\", \"Hồ bơi vô cực\", \"Gần Ngũ Hành Sơn\", \"Buffet hải sản\"]'),(14,'Naman Retreat Danang','HOTEL','Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng','0236-3959-888','reservation@namanretreat.com','https://namanretreat.com','https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=400','Resort boutique 5 sao với kiến trúc tre độc đáo, không gian yên tĩnh, dịch vụ spa và yoga chuyên sâu. Lý tưởng cho nghỉ dưỡng thư giãn.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2015,'naman-retreat-danang','[\"Resort 5 sao\", \"Kiến trúc tre\", \"Yoga & Spa\", \"Bãi biển riêng\", \"Yên tĩnh thư giãn\"]'),(15,'Danang Golden Bay Hotel','HOTEL','01 Lê Văn Duyệt, Sơn Trà, Đà Nẵng','0236-3849-999','reservation@dananggoldenbay.com','https://dananggoldenbay.com','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400','Khách sạn 5 sao nằm trên đường biển Võ Nguyên Giáp với kiến trúc thuyền buồm độc đáo, phòng view biển, rooftop bar và hồ bơi tràn bờ.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2018,'danang-golden-bay-hotel','[\"Khách sạn 5 sao\", \"Kiến trúc thuyền buồm\", \"Rooftop bar\", \"Hồ bơi tràn bờ\", \"View biển đẹp\"]'),(16,'JW Marriott Phu Quoc Emerald Bay','HOTEL','Khu Bãi Khem, An Thới, Phú Quốc, Kiên Giang','0297-3977-999','reservation.phuquoc@marriott.com','https://jwmarriott-phuquoc.com','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400','Resort 5 sao sang trọng tại Bãi Khem với thiết kế lấy cảm hứng từ đại học Pháp thế kỷ 19, bãi biển riêng tuyệt đẹp và dịch vụ đẳng cấp.',4.9,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2017,'jw-marriott-phu-quoc-emerald-bay','[\"Resort 5 sao\", \"Bãi Khem đẹp nhất\", \"Thiết kế độc đáo\", \"Spa Chanterelle\", \"Kids club\"]'),(17,'Vinpearl Resort & Spa Phu Quoc','HOTEL','Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang','0297-3519-999','reservation.phuquoc@vinpearl.com','https://vinpearl.com/phu-quoc','https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400','Resort 5 sao lớn nhất Phú Quốc với hơn 700 phòng, khu vui chơi Vinpearl Land, casino và nhiều hoạt động giải trí hấp dẫn.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2013,'vinpearl-resort-spa-phu-quoc','[\"Resort 5 sao\", \"Vinpearl Land\", \"Safari miễn phí\", \"Bãi Dài\", \"All-inclusive\"]'),(18,'Salinda Resort Phu Quoc Island','HOTEL','Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang','0297-3847-999','reservation@salindaresort.com','https://salindaresort.com','https://images.unsplash.com/photo-1561409037-c7be81613c1f?w=400','Resort 5 sao boutique tại bãi Trường với 121 phòng, thiết kế sang trọng, hồ bơi vô cực view biển và dịch vụ tận tâm.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2014,'salinda-resort-phu-quoc','[\"Resort 5 sao\", \"Bãi Trường\", \"Hồ bơi vô cực\", \"Spa đẳng cấp\", \"Yên tĩnh\"]'),(19,'Fusion Resort Phu Quoc','HOTEL','Đường Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang','0297-6268-888','reservation@fusionresort-phuquoc.com','https://fusionresort-phuquoc.com','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400','Resort 5 sao all-spa-inclusive với dịch vụ spa không giới hạn, bãi biển riêng tuyệt đẹp, phòng pool villa rộng rãi và ẩm thực đa dạng.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2016,'fusion-resort-phu-quoc','[\"Resort 5 sao\", \"All-spa-inclusive\", \"Spa không giới hạn\", \"Pool villa\", \"Bãi Dài\"]'),(20,'Ngon Villa Restaurant','RESTAURANT','10 Phan Bội Châu, Hoàn Kiếm, Hà Nội','024-3942-8162','info@ngonvilla.com','https://ngonvilla.com','https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400','Nhà hàng Việt Nam truyền thống nằm trong biệt thự Pháp cổ, phục vụ hơn 60 món ăn đặc sản các miền trong không gian xanh mát, thân thiện.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2010,'ngon-villa-restaurant','[\"Ẩm thực Việt\", \"Biệt thự cổ\", \"60+ món ăn\", \"Không gian xanh\", \"Giá hợp lý\"]'),(21,'La Verticale Restaurant','RESTAURANT','19 Ngô Văn Sở, Hoàn Kiếm, Hà Nội','024-3944-6317','reservation@verticale-hanoi.com','https://verticale-hanoi.com','https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400','Nhà hàng fine dining Pháp đạt chuẩn Michelin tại Hà Nội, phục vụ ẩm thực Pháp hiện đại trong không gian sang trọng, phù hợp cho dịp đặc biệt.',4.9,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',1999,'la-verticale-restaurant','[\"Fine dining Pháp\", \"Chuẩn Michelin\", \"Set menu cao cấp\", \"Wine pairing\", \"Không gian sang trọng\"]'),(22,'Cau Go Vietnamese Cuisine Restaurant','RESTAURANT','73 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội','024-3926-0808','info@caugorestaurant.com','https://caugorestaurant.com','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400','Nhà hàng Việt Nam hiện đại 4 tầng view Hồ Hoàn Kiếm và chùa Một Cột, phục vụ món ăn Việt sáng tạo và truyền thống với chất lượng cao.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2009,'cau-go-vietnamese-cuisine','[\"Ẩm thực Việt\", \"View Hồ Hoàn Kiếm\", \"4 tầng\", \"Món sáng tạo\", \"Không gian đẹp\"]'),(23,'Cha Ca Thang Long','RESTAURANT','19-21-31 Đường Thành, Hoàn Kiếm, Hà Nội','024-3824-5115','info@chacathanglong.com','https://chacathanglong.com','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400','Nhà hàng chuyên về món chả cá Lã Vọng truyền thống Hà Nội, hơn 130 năm lịch sử, phục vụ món ăn đặc sản chính gốc.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',1871,'cha-ca-thang-long','[\"Chả cá Lã Vọng\", \"130+ năm\", \"Truyền thống\", \"Món đặc sản HN\", \"Chính gốc\"]'),(24,'Sen Tay Ho Restaurant','RESTAURANT','663 Lạc Long Quân, Tây Hồ, Hà Nội','024-3718-2386','info@sentayho.com','https://sentayho.com','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400','Nhà hàng buffet chay cao cấp tại Tây Hồ với hơn 100 món chay đa dạng, không gian yên tĩnh, view hồ đẹp, phù hợp cho gia đình.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2005,'sen-tay-ho-restaurant','[\"Buffet chay\", \"100+ món\", \"View Tây Hồ\", \"Không gian yên tĩnh\", \"Giá hợp lý\"]'),(25,'Noir Dining in the Dark','RESTAURANT','178 Hai Bà Trưng, Quận 3, TP.HCM','028-3829-7115','reservation@noir-restaurant.com','https://noir-restaurant.com','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400','Nhà hàng độc đáo duy nhất tại Việt Nam với trải nghiệm ăn uống trong bóng tối hoàn toàn, được phục vụ bởi nhân viên khiếm thị chuyên nghiệp.',4.8,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2014,'noir-dining-in-the-dark','[\"Dining in the dark\", \"Trải nghiệm độc đáo\", \"Nhân viên khiếm thị\", \"Set menu surprise\", \"Giá trị ý nghĩa\"]'),(26,'The Deck Saigon','RESTAURANT','38 Nguyễn Ư Dĩ, Thảo Điền, Quận 2, TP.HCM','028-3744-6632','info@thedecksaigon.com','https://thedecksaigon.com','https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400','Nhà hàng ven sông Sài Gòn tại Thảo Điền với không gian mở, view sông đẹp, phục vụ món Âu - Á fusion và cocktail sáng tạo.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2008,'the-deck-saigon','[\"Ẩm thực Fusion\", \"View sông Sài Gòn\", \"Không gian mở\", \"Cocktail bar\", \"Khu Thảo Điền\"]'),(27,'Hum Vegetarian Restaurant','RESTAURANT','32 Võ Văn Tần, Quận 3, TP.HCM','028-3930-3819','info@hum-vegetarian.com','https://hum-vegetarian.com','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400','Nhà hàng chay cao cấp với thiết kế hiện đại, phục vụ ẩm thực chay Á - Âu sáng tạo, healthy và thân thiện với môi trường.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2010,'hum-vegetarian-restaurant','[\"Ẩm thực chay\", \"Healthy food\", \"Thiết kế đẹp\", \"Á - Âu fusion\", \"Eco-friendly\"]'),(28,'Nha Hang Ngon 138','RESTAURANT','138 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM','028-3825-7179','info@quananngon.com.vn','https://quananngon.com.vn','https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400','Nhà hàng Việt Nam truyền thống nổi tiếng tại Sài Gòn với hơn 200 món ăn các miền, không gian vườn xanh mát, phù hợp cho đoàn và gia đình.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2002,'nha-hang-ngon-138','[\"Ẩm thực Việt\", \"200+ món ăn\", \"Không gian vườn\", \"Phù hợp đoàn\", \"Giá hợp lý\"]'),(29,'Pizza 4Ps Saigon','RESTAURANT','8/15 Lê Thánh Tôn, Quận 1, TP.HCM','028-3822-0500','reservation@pizza4ps.com','https://pizza4ps.com','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400','Nhà hàng pizza Nhật Bản nổi tiếng tại Sài Gòn với pizza nướng lò củi, burrata tự làm, không gian đẹp và dịch vụ chuyên nghiệp.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2011,'pizza-4ps-saigon','[\"Pizza Nhật Bản\", \"Lò củi\", \"Burrata tự làm\", \"Thiết kế đẹp\", \"Dịch vụ tốt\"]'),(30,'Waterfront Restaurant Danang','RESTAURANT','150-152 Bạch Đằng, Sơn Trà, Đà Nẵng','0236-3959-668','info@waterfront-danang.com','https://waterfront-danang.com','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400','Nhà hàng hải sản tươi sống và BBQ tại bãi biển Mỹ Khê, không gian mở view biển đẹp, phục vụ hải sản tươi ngon với giá hợp lý.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2012,'waterfront-restaurant-danang','[\"Hải sản tươi sống\", \"BBQ\", \"View biển Mỹ Khê\", \"Không gian mở\", \"Giá hợp lý\"]'),(31,'Madame Lan Restaurant','RESTAURANT','4 Bạch Đằng, Hải Châu, Đà Nẵng','0236-3847-400','reservation@madamelan.com','https://madamelan.com','https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400','Nhà hàng ẩm thực Việt Nam truyền thống trong biệt thự Pháp cổ, phục vụ các món ăn đặc sản miền Trung trong không gian vintage đẹp.',4.7,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',NULL,'madame-lan-restaurant','[\"Ẩm thực miền Trung\", \"Biệt thự Pháp\", \"Không gian vintage\", \"Món đặc sản\", \"View sông Hàn\"]'),(32,'A Di Da Vegetarian Restaurant','RESTAURANT','207 Phan Châu Trinh, Hải Châu, Đà Nẵng','0236-3565-755','info@adida-danang.com','https://adida-danang.com','https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400','Nhà hàng chay lâu đời tại Đà Nẵng với buffet chay phong phú hơn 70 món, giá rẻ, không gian rộng rãi, phù hợp cho gia đình.',4.4,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2000,'a-di-da-vegetarian','[\"Buffet chay\", \"70+ món\", \"Giá rẻ\", \"Rộng rãi\", \"Lâu đời\"]'),(33,'Bé Mặn Seafood Restaurant','RESTAURANT','93 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng','0236-3959-339','info@beman-danang.com','https://beman-danang.com','https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400','Nhà hàng hải sản nổi tiếng tại Đà Nẵng với hải sản tươi sống, đặc biệt là ghẹ và tôm hùm, không gian hiện đại, giá cả hợp lý.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',2015,'be-man-seafood','[\"Hải sản tươi sống\", \"Ghẹ & Tôm hùm\", \"Giá hợp lý\", \"Không gian hiện đại\", \"Gần biển\"]'),(34,'The Spice House Restaurant','RESTAURANT','Khu Bãi Trường, Dương Tơ, Phú Quốc','0297-6225-555','info@spicehouse-phuquoc.com','https://spicehouse-phuquoc.com','https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400','Nhà hàng Ấn Độ chính gốc tại Phú Quốc, phục vụ các món curry, tandoori và naan truyền thống, đầu bếp người Ấn, không gian ấm cúng.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',NULL,'the-spice-house-restaurant','[\"Ẩm thực Ấn Độ\", \"Đầu bếp Ấn\", \"Curry & Tandoori\", \"Naan tự làm\", \"Chính gốc\"]'),(35,'Crab House Phu Quoc','RESTAURANT','Chợ đêm Phú Quốc, Dương Đông, Phú Quốc','0297-3994-998','info@crabhouse-phuquoc.com','https://crabhouse-phuquoc.com','https://images.unsplash.com/photo-1544025162-d76694265947?w=400','Nhà hàng hải sản chuyên về cua và ghẹ tươi sống tại chợ đêm Phú Quốc, không gian mở, view biển, giá tốt và phần ăn nhiều.',4.5,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',NULL,'crab-house-phu-quoc','[\"Hải sản\", \"Cua & Ghẹ tươi\", \"Chợ đêm\", \"View biển\", \"Giá tốt\"]'),(36,'Rory\'s Beach Bar','RESTAURANT','Bãi Ông Lang, Cửa Dương, Phú Quốc','0297-3998-196','info@rorysbeachbar.com','https://rorysbeachbar.com','https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400','Beach bar & restaurant tại bãi biển Ông Lang phục vụ BBQ hải sản, cocktail và âm nhạc chill, không gian bãi biển thư giãn.',4.6,'ACTIVE','2025-09-30 17:03:45','2025-10-15 16:15:11',NULL,'rorys-beach-bar','[\"Beach bar\", \"BBQ hải sản\", \"Cocktail\", \"Live music\", \"Bãi Ông Lang\"]');
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `payment_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paid_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `refund_amount` decimal(12,2) DEFAULT '0.00',
  `refund_reason` text COLLATE utf8mb4_unicode_ci,
  `payment_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_code` (`payment_code`),
  KEY `idx_payments_booking_id` (`booking_id`),
  KEY `idx_payments_payment_code` (`payment_code`),
  KEY `idx_payments_transaction_id` (`transaction_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,NULL,3290000.00,'MOMO',NULL,'5e7d37bf-2fa4-443e-b745-2cbc4adae2e5',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:03:29','2025-10-15 16:15:11'),(2,2,NULL,4990000.00,'MOMO',NULL,'8745a72e-c26a-4455-bb3c-c933bec41d76',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:15:05','2025-10-15 16:15:11'),(3,3,NULL,4990000.00,'MOMO',NULL,'ca1afe6b-c984-4856-8723-4bb922b4827e',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:15:50','2025-10-15 16:15:11'),(4,4,NULL,6443000.00,'MOMO',NULL,'a098283d-6abc-409b-b0d6-3a9ad815e137',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:48:32','2025-10-15 16:15:11'),(5,5,NULL,21560000.00,'MOMO',NULL,'c26d3f8c-208c-420b-ba60-534603ae0e4d',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:50:43','2025-10-15 16:15:11'),(6,6,NULL,4990000.00,'MOMO',NULL,'b34fe4d3-a7e3-4db5-9801-c61098a6d1e5',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 21:58:33','2025-10-15 16:15:11'),(7,7,NULL,3290000.00,'MOMO',NULL,'367e64e8-9e3f-413d-b3b5-7644bdde6789',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 22:02:06','2025-10-15 16:15:11'),(8,8,NULL,44990000.00,'MOMO',NULL,'d5b1bbd7-023b-4d0d-87b2-25a31c27c5a8',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 22:05:58','2025-10-15 16:15:11'),(9,9,NULL,2290000.00,'MOMO',NULL,'1344c91a-206a-4b00-974a-ebfc5648e84c',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 22:12:00','2025-10-15 16:15:11'),(10,10,NULL,2490000.00,'MOMO',NULL,'5c66e664-c968-47d1-8d9c-a9d2b1e85f73',NULL,'FAILED',NULL,NULL,NULL,NULL,NULL,'2025-10-01 22:23:56','2025-10-15 16:15:11'),(11,11,NULL,1890000.00,'MOMO',NULL,'07437cc4-43fe-42b3-9edb-8af50d3db855',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-01 22:25:11','2025-10-15 16:15:11'),(12,12,NULL,6490000.00,'MOMO',NULL,'d433ced8-40f6-4344-91bf-19f16367641b',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:13:45','2025-10-15 16:15:11'),(13,13,NULL,6490000.00,'MOMO',NULL,'c7d8a525-2aa7-4aaa-ac02-45e1e6643ee4',NULL,'FAILED',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:20:52','2025-10-15 16:15:11'),(14,14,NULL,1890000.00,'MOMO',NULL,'cdb386e0-86fd-4f81-84e0-f81ff383ea73',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:22:26','2025-10-15 16:15:11'),(15,15,NULL,4990000.00,'MOMO',NULL,'b0258dd0-a973-470d-9992-d36ac14a0dc2',NULL,'FAILED',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:24:47','2025-10-15 16:15:11'),(16,16,NULL,3490000.00,'MOMO',NULL,'d7f73f4e-314a-4859-9289-fa609b6decb2',NULL,'FAILED',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:37:20','2025-10-15 16:15:11'),(17,18,NULL,3490000.00,'MOMO',NULL,'ORDER_1760344068089','ORDER_1760344068089','PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-13 01:27:48','2025-10-15 16:15:11'),(18,19,NULL,1890000.00,'MOMO',NULL,'ORDER_1760344259288','ORDER_1760344259288','PENDING',NULL,NULL,NULL,NULL,NULL,'2025-10-13 01:30:59','2025-10-15 16:15:11'),(19,20,'PAY-F414AA1B',3290000.00,'VNPay','VNPay',NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'Thanh toan tour Huế - Động Phong Nha 3N2Đ - BK64440782268','2025-10-13 07:07:35','2025-10-15 16:15:11'),(20,21,'PAY-FF59A904',3290000.00,'VNPay','VNPay',NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'Thanh toan tour Huế - Động Phong Nha 3N2Đ - BK645351021','2025-10-13 07:08:58','2025-10-15 16:15:11'),(21,22,'PAY-DB8EC61B',4990000.00,'VNPay','VNPay',NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'Thanh toan tour Tây Nguyên - Buôn Ma Thuột 4N3Đ - BK12398683497','2025-10-15 00:13:19','2025-10-15 16:15:11'),(22,23,'PAY-663094DD',2490000.00,'VNPay','VNPay',NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK12702885111','2025-10-15 00:18:23','2025-10-15 16:15:11'),(23,24,'PAY-8E597175',11430000.00,'VNPay','VNPay','VNP-15204305','15204305','COMPLETED','2025-10-15 00:21:43',NULL,NULL,NULL,'Thanh toan tour Seoul - Nami - Everland 5N4Đ - BK12877915413','2025-10-15 00:21:18','2025-10-15 16:15:11'),(24,25,'PAY-F02F0FFC',1890000.00,'VNPay','VNPay','VNP-15204313','15204313','COMPLETED','2025-10-15 00:26:09',NULL,NULL,NULL,'Thanh toan tour Sapa - Fansipan - Cát Cát 2N3Đ - BK13142955535','2025-10-15 00:25:43','2025-10-15 16:15:11'),(25,26,'PAY-48E03F2A',2290000.00,'VNPay','VNPay','VNP-15204338','15204338','COMPLETED','2025-10-15 00:30:29',NULL,NULL,NULL,'Thanh toan tour Cần Thơ - Miền Tây sông nước 3N2Đ - BK13403280794','2025-10-15 00:30:03','2025-10-15 16:15:11'),(26,27,'PAY-5C37EC20',2490000.00,'VNPay','VNPay',NULL,NULL,'FAILED',NULL,NULL,NULL,NULL,'Payment failed with code: 24','2025-10-15 00:31:32','2025-10-15 16:15:11'),(27,27,'PAY-AFE53350',2490000.00,'VNPay','VNPay','VNP-15204348','15204348','COMPLETED','2025-10-15 00:34:44',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - 27','2025-10-15 00:34:20','2025-10-15 16:15:11'),(28,18,'PAY-52C07F18',3490000.00,'VNPay','VNPay',NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'Thanh toan tour Đà Nẵng - Hội An - Bà Nà 4N3Đ - 18','2025-10-15 00:58:08','2025-10-15 16:15:11'),(29,23,'PAY-63D6D625',2490000.00,'VNPay','VNPay','VNP-15204409','15204409','COMPLETED','2025-10-15 00:58:45',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - 23','2025-10-15 00:58:18','2025-10-15 16:15:11'),(30,19,'PAY-7F6D9119',1890000.00,'VNPay','VNPay','VNP-15204448','15204448','COMPLETED','2025-10-15 01:14:12',NULL,NULL,NULL,'Thanh toan tour Sapa - Fansipan - Cát Cát 2N3Đ - 19','2025-10-15 01:13:49','2025-10-15 16:15:11'),(31,28,'PAY-A487F923',2490000.00,'VNPay','VNPay','VNP-15204469','15204469','COMPLETED','2025-10-15 01:23:52',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK16607260514','2025-10-15 01:23:27','2025-10-15 16:15:11'),(32,29,'PAY-31A38903',6490000.00,'VNPay','VNPay','VNP-15205129','15205129','COMPLETED','2025-10-15 08:14:03',NULL,NULL,NULL,'Thanh toan tour Tây Bắc - Điện Biên - Mộc Châu 5N4Đ - BK41213247474','2025-10-15 08:13:33','2025-10-15 16:15:11'),(33,30,'PAY-AA24ACFE',6723000.00,'VNPay','VNPay','VNP-15206779','15206779','COMPLETED','2025-10-16 09:11:48',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK31079952964','2025-10-16 09:11:20','2025-10-16 09:11:48'),(34,31,'PAY-CD189B63',1890000.00,'VNPay','VNPay','VNP-15206784','15206784','COMPLETED','2025-10-16 09:15:08',NULL,NULL,NULL,'Thanh toan tour Sapa - Fansipan - Cát Cát 2N3Đ - BK31285997186','2025-10-16 09:14:46','2025-10-16 09:15:08'),(35,32,'PAY-DF3E3D98',2490000.00,'VNPay','VNPay','VNP-15208246','15208246','COMPLETED','2025-10-17 06:24:13',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK07415737498','2025-10-17 06:23:36','2025-10-17 06:24:13'),(36,33,'PAY-407BCBA6',1890000.00,'VNPay','VNPay','VNP-15208334','15208334','COMPLETED','2025-10-17 07:09:37',NULL,NULL,NULL,'Thanh toan tour Sapa - Fansipan - Cát Cát 2N3Đ - BK10154363208','2025-10-17 07:09:15','2025-10-17 07:09:37'),(37,34,'PAY-0F98824C',2490000.00,'VNPay','VNPay','VNP-15208406','15208406','COMPLETED','2025-10-17 08:24:41',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK1465921827','2025-10-17 08:24:19','2025-10-17 08:24:41'),(38,35,'PAY-9B6D2059',2790000.00,'VNPay','VNPay','VNP-15208413','15208413','COMPLETED','2025-10-17 08:31:49',NULL,NULL,NULL,'Thanh toan tour Đà Lạt - Thành phố ngàn hoa 3N2Đ - BK15078048845','2025-10-17 08:31:18','2025-10-17 08:31:49'),(39,36,'PAY-1C5D2990',11430000.00,'VNPay','VNPay','VNP-15209128','15209128','COMPLETED','2025-10-18 04:28:14',NULL,NULL,NULL,'Thanh toan tour Seoul - Nami - Everland 5N4Đ - BK86864912972','2025-10-18 04:27:45','2025-10-18 04:28:14'),(40,37,'PAY-88A148BC',3490000.00,'VNPay','VNPay','VNP-15209142','15209142','COMPLETED','2025-10-18 04:57:10',NULL,NULL,NULL,'Thanh toan tour Đà Nẵng - Hội An - Bà Nà 4N3Đ - BK88605448543','2025-10-18 04:56:46','2025-10-18 04:57:10'),(41,38,'PAY-64FF53C1',2490000.00,'VNPay','VNPay','VNP-15209144','15209144','COMPLETED','2025-10-18 05:01:08',NULL,NULL,NULL,'Thanh toan tour Hà Nội - Hạ Long - Ninh Bình 3N2Đ - BK88806168902','2025-10-18 05:00:06','2025-10-18 05:01:08'),(42,39,'PAY-F9BF17C8',3290000.00,'VNPay','VNPay','VNP-15209148','15209148','COMPLETED','2025-10-18 05:06:27',NULL,NULL,NULL,'Thanh toan tour Huế - Động Phong Nha 3N2Đ - BK89170116413','2025-10-18 05:06:10','2025-10-18 05:06:27');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_transactions`
--

DROP TABLE IF EXISTS `point_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `points` int NOT NULL COMMENT 'Số điểm (+/-)',
  `transaction_type` enum('ADJUSTED','BONUS','EARNED','EXPIRED','PENALTY','REDEEMED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` enum('ADMIN','BIRTHDAY','BOOKING','FIRST_BOOKING','PROMOTION','REFERRAL','REVIEW','SOCIAL_SHARE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` bigint DEFAULT NULL COMMENT 'ID của booking/review/etc',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mô tả giao dịch',
  `balance_before` int NOT NULL COMMENT 'Số điểm trước giao dịch',
  `balance_after` int NOT NULL COMMENT 'Số điểm sau giao dịch',
  `expires_at` date DEFAULT NULL COMMENT 'Ngày hết hạn điểm',
  `is_expired` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Đã hết hạn chưa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_point_trans_user` (`user_id`),
  KEY `idx_point_trans_type` (`transaction_type`),
  KEY `idx_point_trans_source` (`source_type`,`source_id`),
  KEY `idx_point_trans_expires` (`expires_at`,`is_expired`),
  KEY `idx_point_trans_created` (`created_at`),
  CONSTRAINT `point_transactions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lịch sử giao dịch điểm';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_transactions`
--

LOCK TABLES `point_transactions` WRITE;
/*!40000 ALTER TABLE `point_transactions` DISABLE KEYS */;
INSERT INTO `point_transactions` VALUES (1,1205,514350,'EARNED','BOOKING',36,'Tích điểm từ booking #36 (x3.0)',0,514350,'2027-10-18',0,'2025-10-18 04:39:00'),(2,1205,257175,'EARNED','BOOKING',36,'Tích điểm từ booking #36 (x1.5)',514350,771525,'2027-10-18',0,'2025-10-18 04:46:04'),(3,1204,69800,'EARNED','BOOKING',37,'Tích điểm từ booking #37 (x2.0)',0,69800,'2027-10-18',0,'2025-10-18 04:57:27'),(4,1206,49800,'EARNED','BOOKING',38,'Tích điểm từ booking #38 (x2.0)',0,49800,'2027-10-18',0,'2025-10-18 05:01:37'),(5,1206,1645,'EARNED','BOOKING',39,'Tích điểm từ booking #39 (x1.0)',49800,51445,'2027-10-18',0,'2025-10-18 05:06:36');
/*!40000 ALTER TABLE `point_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_vouchers`
--

DROP TABLE IF EXISTS `point_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `voucher_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã voucher',
  `voucher_type` enum('AMOUNT','PERCENTAGE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_value` decimal(12,2) NOT NULL COMMENT 'Giá trị voucher (VND hoặc %)',
  `points_cost` int NOT NULL COMMENT 'Số điểm đã đổi',
  `min_order_value` decimal(12,2) DEFAULT '0.00' COMMENT 'Giá trị đơn hàng tối thiểu',
  `max_discount` decimal(12,2) DEFAULT NULL COMMENT 'Giảm tối đa (với %)',
  `status` enum('ACTIVE','CANCELLED','EXPIRED','USED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` bigint DEFAULT NULL COMMENT 'ID booking đã sử dụng',
  `used_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian sử dụng',
  `expires_at` date NOT NULL COMMENT 'Ngày hết hạn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_voucher_code` (`voucher_code`),
  KEY `idx_voucher_user` (`user_id`),
  KEY `idx_voucher_code` (`voucher_code`),
  KEY `idx_voucher_status` (`status`),
  KEY `idx_voucher_expires` (`expires_at`),
  KEY `idx_voucher_booking` (`booking_id`),
  CONSTRAINT `point_vouchers_booking_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `point_vouchers_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng voucher đổi từ điểm';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_vouchers`
--

LOCK TABLES `point_vouchers` WRITE;
/*!40000 ALTER TABLE `point_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `point_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(12,2) NOT NULL,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `min_order_amount` decimal(12,2) DEFAULT NULL,
  `usage_limit` int DEFAULT '0',
  `used_count` int DEFAULT '0',
  `per_user_limit` int DEFAULT '1',
  `applicable_tours` text COLLATE utf8mb4_unicode_ci,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_promotions_code` (`code`),
  KEY `idx_promotions_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'SUMMER2025','Khuyến mãi mùa hè','Giảm giá tour hè','PERCENTAGE',15.00,0.00,0.00,100,0,1,NULL,'2025-04-30 10:00:00','2025-08-31 09:59:59','EXPIRED','2025-09-30 14:19:08','2025-10-15 16:15:11'),(2,'NEWUSER50','Ưu đãi khách hàng mới','Giảm 50k đơn đầu tiên','FIXED_AMOUNT',50000.00,50000.00,1000000.00,500,0,1,NULL,'2024-12-31 17:00:00','2025-12-30 17:00:00','ACTIVE','2025-09-30 14:19:08','2025-10-16 09:31:25'),(3,'BLACKFRIDAY','Black Friday Sale','Giảm 20% mọi tour','PERCENTAGE',20.00,5000000.00,10000000.00,200,0,1,NULL,'2025-11-19 17:00:00','2025-11-29 17:00:00','ACTIVE','2025-09-30 14:19:08','2025-10-15 16:15:11'),(4,'WELCOME10','Chào mừng khách hàng mới','Giảm 10% cho đơn hàng đầu tiên','PERCENTAGE',10.00,500000.00,2000000.00,1000,0,1,NULL,'2024-12-31 17:00:00','2025-12-30 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11'),(5,'SUMMER25','Ưu đãi mùa hè','Giảm 25% cho tours biển đảo','PERCENTAGE',25.00,2000000.00,5000000.00,500,0,2,NULL,'2025-04-30 17:00:00','2025-08-30 17:00:00','EXPIRED','2025-10-01 06:22:52','2025-10-15 16:15:11'),(6,'FLASH50','Flash Sale cuối tuần','Giảm ngay 50%','PERCENTAGE',50.00,5000000.00,10000000.00,100,0,1,NULL,'2025-09-30 17:00:00','2025-10-30 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11'),(7,'SAVE500K','Giảm 500K cho tour cao cấp','Giảm 500,000đ cho đơn từ 15 triệu','FIXED_AMOUNT',500000.00,NULL,15000000.00,200,0,1,NULL,'2024-12-31 17:00:00','2025-12-30 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11'),(8,'SAVE1M','Giảm 1 triệu tour quốc tế','Giảm 1,000,000đ cho tour quốc tế từ 30 triệu','FIXED_AMOUNT',1000000.00,NULL,30000000.00,150,0,1,NULL,'2024-12-31 17:00:00','2025-12-30 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11'),(9,'NEWYEAR50','Tết Nguyên Đán 2026','Giảm 50% tour Tết','PERCENTAGE',50.00,3000000.00,8000000.00,200,0,1,NULL,'2026-01-14 17:00:00','2026-02-14 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11'),(10,'GROUP20','Giảm giá đoàn','Giảm 20% cho đoàn từ 10 người','PERCENTAGE',20.00,2000000.00,5000000.00,100,0,1,NULL,'2024-12-31 17:00:00','2025-12-30 17:00:00','ACTIVE','2025-10-01 06:22:52','2025-10-15 16:15:11');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referrals`
--

DROP TABLE IF EXISTS `referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referrals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `referrer_id` bigint NOT NULL COMMENT 'Người giới thiệu',
  `referee_id` bigint NOT NULL COMMENT 'Người được giới thiệu',
  `referral_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giới thiệu',
  `status` enum('CANCELLED','COMPLETED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points_earned` int DEFAULT '0' COMMENT 'Điểm đã nhận',
  `first_booking_id` bigint DEFAULT NULL COMMENT 'Booking đầu tiên của người được giới thiệu',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian hoàn thành',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_referral_referrer` (`referrer_id`),
  KEY `idx_referral_referee` (`referee_id`),
  KEY `idx_referral_code` (`referral_code`),
  KEY `idx_referral_status` (`status`),
  KEY `referrals_booking_fk` (`first_booking_id`),
  CONSTRAINT `referrals_booking_fk` FOREIGN KEY (`first_booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `referrals_referee_fk` FOREIGN KEY (`referee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `referrals_referrer_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng giới thiệu bạn bè';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referrals`
--

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;
/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` datetime(6) DEFAULT NULL,
  `revoke_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_revoked` bit(1) NOT NULL,
  `revoked_at` datetime(6) DEFAULT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKghpmfn23vmxfu3spu3lfg4r2d` (`token`),
  KEY `idx_refresh_tokens_token` (`token`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  KEY `idx_refresh_tokens_expires_at` (`expires_at`),
  CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `tour_id` bigint DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `images` text COLLATE utf8mb4_unicode_ci,
  `helpful_count` int DEFAULT '0',
  `admin_reply` text COLLATE utf8mb4_unicode_ci,
  `replied_by` bigint DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `helpful_user_ids` text COLLATE utf8mb4_unicode_ci COMMENT 'Comma-separated list of user IDs who voted helpful',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `replied_by` (`replied_by`),
  KEY `idx_reviews_tour_id` (`tour_id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `idx_reviews_status` (`status`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`replied_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,999,1,1,5,'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Cảnh đẹp tuyệt vời, đồ ăn ngon. Gia đình tôi rất hài lòng và sẽ quay lại!',NULL,15,'Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ! Chúng tôi rất vui khi tour đã mang lại trải nghiệm tuyệt vời cho gia đình bạn.',1,'2025-10-03 03:30:00','APPROVED',NULL,'2025-10-02 08:30:00','2025-10-15 16:15:11',NULL),(2,NULL,1,NULL,4,'Tour tốt, cảnh đẹp. Tuy nhiên thời gian di chuyển hơi dài. Nên có thêm thời gian tự do tham quan.',NULL,8,'Cảm ơn góp ý của bạn! Chúng tôi sẽ xem xét điều chỉnh lịch trình để phù hợp hơn.',1,'2025-10-03 04:00:00','APPROVED',NULL,'2025-10-02 11:45:00','2025-10-15 16:15:11',NULL),(3,999,2,NULL,5,'Chinh phục đỉnh Fansipan thật tuyệt! Cảm giác đứng trên nóc nhà Đông Dương không gì sánh bằng. HDV am hiểu về địa phương.',NULL,22,NULL,NULL,NULL,'APPROVED',NULL,'2025-10-01 13:15:00','2025-10-15 16:15:11',NULL),(4,NULL,2,NULL,5,'Sapa đẹp mê hồn! Thời tiết se lạnh, người dân thân thiện. Homestay sạch sẽ, ăn ngon. Highly recommended!',NULL,18,'Thank you! Sapa luôn là điểm đến yêu thích của du khách miền xuôi ?',2,'2025-10-02 02:00:00','APPROVED',NULL,'2025-10-01 15:30:00','2025-10-15 16:15:11',NULL),(5,999,3,NULL,4,'Đà Lạt thơ mộng và lãng mạn. Khách sạn tốt, đồ ăn ngon. Nếu có thêm 1 ngày nữa thì hoàn hảo!',NULL,13,'Chúng tôi có tour Đà Lạt 4N3Đ nếu bạn muốn khám phá nhiều hơn nha!..',1,'2025-10-06 02:23:39','APPROVED',NULL,'2025-10-03 03:20:00','2025-10-17 09:08:26','1204'),(6,NULL,3,NULL,5,'Perfect cho couple! Mình và bạn gái đi rất vui. Chụp hình nhiều góc đẹp. Cảm ơn anh HDV đã chụp ảnh nhiệt tình ?',NULL,25,'test',NULL,'2025-10-06 02:04:01','APPROVED',NULL,'2025-10-02 09:45:00','2025-10-17 09:09:05',NULL),(7,999,6,NULL,5,'Đà Nẵng - Hội An là combo hoàn hảo! Bà Nà Hills cực đỉnh, Hội An về đêm lung linh. Resort view biển tuyệt đẹp!',NULL,30,'Rất vui khi tour đã để lại ấn tượng đẹp! Hẹn gặp lại quý khách trong các tour tiếp theo!',1,'2025-10-04 02:30:00','APPROVED',NULL,'2025-10-03 12:00:00','2025-10-15 16:15:11',NULL),(8,NULL,6,NULL,4,'Tour tốt, tuy nhiên nên có thêm thời gian ở Hội An. 1 ngày không đủ để khám phá hết phố cổ này.',NULL,10,'Cảm ơn feedback! Chúng tôi đang có tour Hội An 3N2Đ chuyên sâu nếu bạn quan tâm.',2,'2025-10-04 03:00:00','APPROVED',NULL,'2025-10-04 01:15:00','2025-10-15 16:15:11',NULL),(9,999,9,NULL,5,'Nha Trang thật sự là thiên đường biển! Tour 4 đảo rất thú vị, lặn ngắm san hô đẹp mắt. Hải sản tươi ngon!',NULL,20,NULL,NULL,NULL,'APPROVED',NULL,'2025-10-02 07:30:00','2025-10-15 16:15:11',NULL),(10,NULL,9,NULL,3,'Tour ok nhưng hơi đông khách, phải chờ lâu khi tham quan. Khách sạn bình thường, không như mô tả lắm.',NULL,5,'Xin lỗi vì trải nghiệm chưa tốt. Chúng tôi sẽ cải thiện việc phân bổ khách và kiểm tra lại chất lượng khách sạn.',1,'2025-10-03 04:30:00','APPROVED',NULL,'2025-10-03 02:00:00','2025-10-15 16:15:11',NULL),(11,999,10,NULL,5,'Resort 5 sao đỉnh của chóp! Bãi biển riêng tuyệt đẹp, ăn uống tuyệt vời. Đáng từng đồng! Highly recommend cho ai muốn nghỉ dưỡng cao cấp.',NULL,35,'Cảm ơn! Phú Quốc là điểm đến yêu thích cho các kỳ nghỉ sang trọng. Hẹn gặp lại!',1,'2025-10-05 03:00:00','APPROVED',NULL,'2025-10-04 13:30:00','2025-10-15 16:15:11',NULL),(12,NULL,10,NULL,5,'Tuyệt vời! Safari Zoo, Grand World, Vinpearl đều rất đáng trải nghiệm. Bamboo Circus show cực đỉnh ?',NULL,28,NULL,NULL,NULL,'APPROVED',NULL,'2025-10-04 10:00:00','2025-10-15 16:15:11',NULL),(13,999,14,NULL,2,'Tour không như mong đợi. HDV thiếu kinh nghiệm, lịch trình bị delay nhiều. Cần cải thiện!',NULL,3,NULL,NULL,NULL,'PENDING',NULL,'2025-10-06 01:00:00','2025-10-15 16:15:11',NULL),(14,NULL,16,NULL,1,'Tour tệ, lừa đảo, không nên đi. Công ty này chỉ biết lừa tiền!!!',NULL,0,NULL,NULL,NULL,'REJECTED',NULL,'2025-10-05 05:00:00','2025-10-15 16:15:11',NULL),(15,1204,1,34,5,'Tuyệt vời quá',NULL,0,NULL,NULL,NULL,'APPROVED',NULL,'2025-10-17 09:00:34','2025-10-17 09:01:41',NULL),(16,1204,3,35,5,'tôi rất thích ',NULL,1,'Cảm ơn đã đánh giá',NULL,'2025-10-17 20:32:17','APPROVED',NULL,'2025-10-17 09:08:19','2025-10-17 20:39:13','1204');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Quản trị viên hệ thống','2025-09-30 14:18:46'),(2,'Staff','Nhân viên','2025-09-30 14:18:46'),(3,'Customer','Khách hàng','2025-09-30 14:18:46');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_public` bit(1) DEFAULT NULL,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_type` enum('BOOLEAN','JSON','NUMBER','STRING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setting_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnm18l4pyovtvd8y3b3x0l2y64` (`setting_key`),
  UNIQUE KEY `idx_system_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `target_audiences`
--

DROP TABLE IF EXISTS `target_audiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `target_audiences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `target_audiences`
--

LOCK TABLES `target_audiences` WRITE;
/*!40000 ALTER TABLE `target_audiences` DISABLE KEYS */;
INSERT INTO `target_audiences` VALUES (1,'Gia đình','Phù hợp cho gia đình có trẻ em',NULL),(2,'Cặp đôi','Lý tưởng cho các cặp đôi muốn có kỷ niệm',NULL),(3,'Nhóm bạn','Dành cho nhóm bạn bè đi cùng',NULL),(4,'Người cao tuổi','Phù hợp với người lớn tuổi, lịch trình nhẹ nhàng',NULL),(5,'Du khách độc hành','Thích hợp cho người đi một mình',NULL);
/*!40000 ALTER TABLE `target_audiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_faqs`
--

DROP TABLE IF EXISTS `tour_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_faqs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faqs_tour_id` (`tour_id`),
  KEY `idx_faqs_tour` (`tour_id`),
  KEY `idx_faqs_display_order` (`display_order`),
  CONSTRAINT `tour_faqs_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_faqs`
--

LOCK TABLES `tour_faqs` WRITE;
/*!40000 ALTER TABLE `tour_faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tour_faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_images`
--

DROP TABLE IF EXISTS `tour_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tour_images_tour_id` (`tour_id`),
  CONSTRAINT `tour_images_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_images`
--

LOCK TABLES `tour_images` WRITE;
/*!40000 ALTER TABLE `tour_images` DISABLE KEYS */;
INSERT INTO `tour_images` VALUES (46,2,'http://localhost:8080/uploads/9eaa9ce1-2ecf-4ce2-920c-a5b1aead36d4.webp',NULL,0,0,'2025-10-19 05:58:54'),(47,2,'http://localhost:8080/uploads/74401704-9bc8-4992-9cf4-2f4bc59db933.webp',NULL,0,0,'2025-10-19 05:58:54'),(48,2,'http://localhost:8080/uploads/b1918d84-7252-45be-a284-96eabe32cc1e.webp',NULL,0,0,'2025-10-19 05:58:54'),(49,2,'http://localhost:8080/uploads/9fb7f659-42d2-49d3-b936-50f9d2710546.jpg',NULL,0,0,'2025-10-19 05:58:54'),(50,3,'http://localhost:8080/uploads/ef099eb5-95b5-4db4-b407-79aa55058bdb.png',NULL,0,0,'2025-10-19 06:01:45'),(51,3,'http://localhost:8080/uploads/83d5f43f-28e6-4120-b3c6-dda6af36e7e9.webp',NULL,0,0,'2025-10-19 06:01:45'),(52,3,'http://localhost:8080/uploads/d043657a-b6b0-475a-b1fa-d2b7be142e7c.jpg',NULL,0,0,'2025-10-19 06:01:45'),(53,3,'http://localhost:8080/uploads/af2736bd-837e-4a9a-b87e-4d448a31c744.jpg',NULL,0,0,'2025-10-19 06:01:45'),(54,4,'http://localhost:8080/uploads/b69ce005-4a57-466e-bbec-4da37d3cf8f3.jpg',NULL,0,0,'2025-10-19 06:02:37'),(55,4,'http://localhost:8080/uploads/9ba66dcf-4884-4bf3-beb8-a4ec956058b5.jpg',NULL,0,0,'2025-10-19 06:02:37'),(56,4,'http://localhost:8080/uploads/3437f0b4-efaa-46b3-a450-817324d81524.jpg',NULL,0,0,'2025-10-19 06:02:37'),(57,4,'http://localhost:8080/uploads/8c48e3a6-88d5-4e1d-8611-0a0243a0fbcf.jpg',NULL,0,0,'2025-10-19 06:02:37'),(58,5,'http://localhost:8080/uploads/d8d0e7f8-b91a-4402-bded-f2e434e26c22.webp',NULL,0,0,'2025-10-19 06:19:56'),(59,5,'http://localhost:8080/uploads/b75f43dd-0e5e-4fb1-8333-7fc7118841f7.jpg',NULL,0,0,'2025-10-19 06:19:56'),(60,5,'http://localhost:8080/uploads/b0cbb1fb-a588-4eb8-a096-dcda2bf5a991.jpg',NULL,0,0,'2025-10-19 06:19:56'),(61,6,'http://localhost:8080/uploads/b51fe29c-1b4b-40da-8837-8def5518acc8.jpg',NULL,0,0,'2025-10-19 06:20:52'),(62,6,'http://localhost:8080/uploads/37a80111-4a7d-479e-b050-7e5558b65ba9.jpg',NULL,0,0,'2025-10-19 06:20:52'),(63,6,'http://localhost:8080/uploads/7927a930-4ea7-45f6-b154-fec5b2dcd118.jpg',NULL,0,0,'2025-10-19 06:20:52'),(64,6,'http://localhost:8080/uploads/6b98b1b6-104e-4e34-a47f-f67038074a90.jpg',NULL,0,0,'2025-10-19 06:20:52'),(65,7,'http://localhost:8080/uploads/13d443bd-dd7d-4cb9-b35a-5ad3b8514dbc.jpg',NULL,0,0,'2025-10-19 06:21:49'),(66,7,'http://localhost:8080/uploads/8690d741-1365-42d4-8962-d8496527b660.jpg',NULL,0,0,'2025-10-19 06:21:49'),(67,7,'http://localhost:8080/uploads/db58da10-b13a-457b-8998-be7cb4056dff.jpg',NULL,0,0,'2025-10-19 06:21:49'),(68,7,'http://localhost:8080/uploads/0c338def-e094-4f6e-b607-49ce9cd5939f.png',NULL,0,0,'2025-10-19 06:21:49'),(69,1,'http://localhost:8080/uploads/84c57727-ac4a-4de7-8997-5c0f5ad364a6.jpg',NULL,0,0,'2025-10-19 06:30:41'),(70,1,'http://localhost:8080/uploads/bc39ed43-b18c-41c7-996e-7f85d1956c8d.webp',NULL,0,0,'2025-10-19 06:30:41'),(71,1,'http://localhost:8080/uploads/a44d6ca7-5e51-4808-8979-66ed8faccb43.jpg',NULL,0,0,'2025-10-19 06:30:41'),(72,1,'http://localhost:8080/uploads/58d63638-bddf-4083-a9b2-7ecc104e540f.jpg',NULL,0,0,'2025-10-19 06:30:41');
/*!40000 ALTER TABLE `tour_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_itineraries`
--

DROP TABLE IF EXISTS `tour_itineraries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_itineraries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint DEFAULT NULL,
  `day_number` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activities` text COLLATE utf8mb4_unicode_ci,
  `meals` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accommodation` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  `partner_id` bigint DEFAULT NULL,
  `accommodation_partner_id` bigint DEFAULT NULL,
  `meals_partner_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `partner_id` (`partner_id`),
  KEY `accommodation_partner_id` (`accommodation_partner_id`),
  KEY `meals_partner_id` (`meals_partner_id`),
  KEY `idx_itineraries_tour_id` (`tour_id`),
  CONSTRAINT `tour_itineraries_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tour_itineraries_ibfk_2` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tour_itineraries_ibfk_3` FOREIGN KEY (`accommodation_partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tour_itineraries_ibfk_4` FOREIGN KEY (`meals_partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_itineraries`
--

LOCK TABLES `tour_itineraries` WRITE;
/*!40000 ALTER TABLE `tour_itineraries` DISABLE KEYS */;
INSERT INTO `tour_itineraries` VALUES (57,9,1,'Ngày 1: TP.HCM - Nha Trang',NULL,NULL,'05:00: Xe khởi hành từ TP.HCM\n13:00: Đến Nha Trang, check-in khách sạn\n14:00: Ăn trưa hải sản\n15:30: Tắm biển, tắm bùn khoáng I-resort\n18:00: Ăn tối BBQ buffet\n20:00: Dạo phố biển, chợ đêm','Ăn trưa, Ăn tối','Khách sạn 3* gần biển',NULL,13,13,14,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(58,9,2,'Ngày 2: Tour 4 đảo Nha Trang',NULL,NULL,'07:00: Ăn sáng\n08:00: Du thuyền ra đảo\n09:00: Đảo Hòn Mun - lặn ngắm san hô\n11:00: Đảo Hòn Tằm - tắm biển, thư giãn\n12:30: Ăn trưa hải sản trên thuyền\n14:00: Đảo Hòn Miễu - thủy族cung\n16:00: Về bờ\n18:00: Ăn tối lẩu hải sản','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 3* gần biển',NULL,13,13,14,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(59,9,3,'Ngày 3: Vinpearl - TP.HCM',NULL,NULL,'07:00: Ăn sáng\n08:00: Tham quan Vinpearl Land (tự túc vé)\n12:00: Ăn trưa\n13:30: Mua sắm đặc sản\n15:00: Khởi hành về TP.HCM\n23:00: Về đến TP.HCM, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,13,NULL,14,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(60,10,1,'Ngày 1: TP.HCM - Phú Quốc',NULL,NULL,'08:00: Bay từ TP.HCM đi Phú Quốc\n09:30: Đón tại sân bay\n10:30: Check-in resort 5*\n12:00: Ăn trưa tại resort\n14:00: Nghỉ ngơi, tắm biển riêng\n16:00: Sunset Sanato Beach Club\n18:30: BBQ hải sản tại resort\n20:00: Fireshow, nhạc sống','Ăn trưa, Ăn tối','Resort 5* mặt biển',NULL,15,15,16,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(61,10,2,'Ngày 2: Khám phá Nam đảo',NULL,NULL,'07:00: Ăn sáng buffet\n08:30: Vinpearl Safari (vé bao gồm)\n12:00: Ăn trưa\n14:00: Grand World, Venice Hòa Bình\n17:00: Show Bamboo Circus\n19:00: Ăn tối tại Grand World','Ăn sáng, Ăn trưa, Ăn tối','Resort 5* mặt biển',NULL,15,15,16,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(62,10,3,'Ngày 3: Tour Bắc đảo & câu cá',NULL,NULL,'07:00: Ăn sáng\n08:00: Câu cá trên biển\n10:00: Lặn ngắm san hô\n12:00: Ăn trưa hải sản tự câu\n14:00: Bãi Sao, Hòn Móng Tay\n17:00: Ngắm hoàng hôn\n19:00: Ăn tối tôm hùm nướng','Ăn sáng, Ăn trưa, Ăn tối','Resort 5* mặt biển',NULL,15,15,16,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(63,10,4,'Ngày 4: Phú Quốc - TP.HCM',NULL,NULL,'07:00: Ăn sáng\n08:00: Tự do tắm biển\n10:00: Mua sắm đặc sản (ngọc trai, tiêu)\n12:00: Ăn trưa\n14:00: Ra sân bay\n16:00: Bay về TP.HCM, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,15,NULL,16,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(64,14,1,'Ngày 1: Hà Nội - Ninh Bình - Hà Nội',NULL,NULL,'06:00: Xe đón tại Hà Nội\n08:30: Đến Ninh Bình, tham quan Tràng An\n10:00: Đi thuyền Tràng An (2 giờ)\n12:00: Ăn trưa cơm dê núi\n13:30: Leo Hang Múa (500 bậc)\n15:00: Chùa Bái Đính\n17:00: Khởi hành về Hà Nội\n19:30: Về đến Hà Nội, kết thúc tour','Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(65,16,1,'Ngày 1: Hà Nội - Hà Giang',NULL,NULL,'21:00: Xe limousine khởi hành từ Hà Nội\n04:00: Đến Hà Giang, ăn sáng\n06:00: Khởi hành chinh phục Hà Giang\n09:00: Cổng trời Quản Bạ\n12:00: Ăn trưa tại Yên Minh\n15:00: Đến Đồng Văn, check-in homestay\n18:00: Ăn tối, giao lưu người dân tộc','Ăn sáng, Ăn trưa, Ăn tối','Homestay bản làng',NULL,17,17,18,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(66,16,2,'Ngày 2: Đồng Văn - Mèo Vạc',NULL,NULL,'06:00: Ăn sáng\n07:00: Tham quan phố cổ Đồng Văn\n09:00: Cột cờ Lũng Cú (điểm cực Bắc)\n12:00: Ăn trưa\n14:00: Chinh phục đèo Mã Pí Lèng\n16:00: Đến Mèo Vạc, check-in\n18:00: Ăn tối, múa lửa','Ăn sáng, Ăn trưa, Ăn tối','Homestay view đèo',NULL,19,19,20,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(67,16,3,'Ngày 3: Mèo Vạc - Hà Giang',NULL,NULL,'06:00: Ăn sáng\n07:00: Sông Nho Quế\n09:00: Cao nguyên đá Đồng Văn\n12:00: Ăn trưa\n14:00: Về Hà Giang\n17:00: Check-in khách sạn\n18:30: Ăn tối phở cuốn Hà Giang','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 3* TP Hà Giang',NULL,21,21,22,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(68,16,4,'Ngày 4: Hà Giang - Hà Nội',NULL,NULL,'06:00: Ăn sáng\n07:00: Khởi hành về Hà Nội\n12:00: Ăn trưa tại Tuyên Quang\n17:00: Về đến Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,21,NULL,22,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(73,25,1,'Ngày 1: Hà Nội - Seoul',NULL,NULL,'06:00: Bay từ Hà Nội đi Seoul\n10:00: Đến Seoul (giờ địa phương)\n12:00: Ăn trưa BBQ Hàn Quốc\n14:00: Tham quan Cung điện Gyeongbokgung\n16:00: Làng Hanok Bukchon\n18:00: Check-in khách sạn\n19:00: Ăn tối Kimchi jjigae\n21:00: Dạo phố Myeongdong','Ăn trưa, Ăn tối','Khách sạn 4* Seoul',NULL,27,27,28,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(74,25,2,'Ngày 2: Seoul City Tour',NULL,NULL,'07:00: Ăn sáng\n08:00: Tháp N Seoul Tower\n10:00: Lotte World (công viên giải trí)\n12:00: Ăn trưa Bibimbap\n14:00: Mua sắm tại Gangnam\n18:00: Ăn tối Samgyeopsal\n20:00: Show Nanta hoặc K-Pop','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Seoul',NULL,27,27,28,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(75,25,3,'Ngày 3: Đảo Nami - Everland',NULL,NULL,'06:00: Ăn sáng\n07:00: Đi đảo Nami (2h)\n09:00: Tham quan đảo Nami (phim Winter Sonata)\n12:00: Ăn trưa gà hầm sâm\n14:00: Everland (Disney của Hàn Quốc)\n19:00: Về Seoul, ăn tối\n21:00: Sông Hàn về đêm','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Seoul',NULL,27,27,28,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(76,25,4,'Ngày 4: Ski Resort + Jjimjilbang',NULL,NULL,'07:00: Ăn sáng\n08:00: Đi trượt tuyết Ski Resort (mùa đông)\n12:00: Ăn trưa lẩu Hàn Quốc\n14:00: Trải nghiệm Jjimjilbang (sauna Hàn)\n17:00: Mua sắm duty free\n19:00: Ăn tối Bulgogi\n21:00: Chợ đêm Dongdaemun','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Seoul',NULL,27,27,28,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(77,25,5,'Ngày 5: Seoul - Hà Nội',NULL,NULL,'07:00: Ăn sáng\n08:00: Tự do mua sắm phút chót\n11:00: Ăn trưa\n13:00: Ra sân bay\n15:00: Bay về Hà Nội\n17:00: Về đến Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,27,NULL,28,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(96,8,1,'Ngày 1: TP.HCM - Quy Nhơn',NULL,NULL,'Bay đến Quy Nhơn, Eo Gió, Kỳ Co','Ăn trưa, Ăn tối','Resort 3* biển',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(97,8,2,'Ngày 2: Quy Nhơn - Phú Yên',NULL,NULL,'Bãi Xép, Gành Đá Đĩa, Vũng Rô','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn Tuy Hòa',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(98,8,3,'Ngày 3: Phú Yên - TP.HCM',NULL,NULL,'Mũi Điện, bay về TP.HCM','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(99,11,1,'Ngày 1: TP.HCM - Côn Đảo',NULL,NULL,'Bay đến Côn Đảo, tham quan nhà tù','Ăn trưa, Ăn tối','Resort biển',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(100,11,2,'Ngày 2: Côn Đảo',NULL,NULL,'Nghĩa trang Hàng Dương, lặn ngắm san hô','Ăn sáng, Ăn trưa, Ăn tối','Resort biển',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(101,11,3,'Ngày 3: Côn Đảo - TP.HCM',NULL,NULL,'Bãi Đầm Trầu, bay về TP.HCM','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(102,12,1,'Ngày 1: TP.HCM - Cần Thơ',NULL,NULL,'Xe đi Cần Thơ, chợ nổi Cái Răng','Ăn trưa, Ăn tối','Khách sạn 3*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(103,12,2,'Ngày 2: Cần Thơ',NULL,NULL,'Vườn trái cây, nhà cổ Bình Thủy','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 3*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(104,12,3,'Ngày 3: Cần Thơ - TP.HCM',NULL,NULL,'Chùa Khmer, về TP.HCM','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(105,13,1,'Ngày 1: Hà Nội - Cát Bà',NULL,NULL,'Xe + phà đến Cát Bà, tắm biển','Ăn trưa, Ăn tối','Khách sạn biển',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(106,13,2,'Ngày 2: Vịnh Lan Hạ',NULL,NULL,'Du thuyền Lan Hạ, kayak, lặn biển, về Hà Nội','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(107,15,1,'Ngày 1: Hà Nội - Mai Châu',NULL,NULL,'Xe đi Mai Châu, đạp xe làng','Ăn trưa, Ăn tối','Homestay',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(108,15,2,'Ngày 2: Mai Châu - Hà Nội',NULL,NULL,'Trekking, múa sạp, về Hà Nội','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(109,17,1,'Ngày 1: TP.HCM - Mũi Né',NULL,NULL,'Xe đi Mũi Né, đồi cát','Ăn trưa, Ăn tối','Resort',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(110,17,2,'Ngày 2: Mũi Né',NULL,NULL,'Suối tiên, làng chài, tắm biển','Ăn sáng, Ăn trưa, Ăn tối','Resort',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(111,17,3,'Ngày 3: Mũi Né - TP.HCM',NULL,NULL,'Bình minh, về TP.HCM','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(112,18,1,'Ngày 1: TP.HCM - Vũng Tàu',NULL,NULL,'Xe đi Vũng Tàu, tắm biển','Ăn trưa, Ăn tối','Khách sạn',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(113,18,2,'Ngày 2: Vũng Tàu - TP.HCM',NULL,NULL,'Tượng Chúa, Bạch Dinh, về','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(114,19,1,'Ngày 1: Hà Nội - Phong Nha',NULL,NULL,'Bay/xe đến Phong Nha','Ăn trưa, Ăn tối','Homestay',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(115,19,2,'Ngày 2: Động Thiên Đường',NULL,NULL,'Động Thiên Đường, Paradise Cave','Ăn sáng, Ăn trưa, Ăn tối','Homestay',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(116,19,3,'Ngày 3: Dark Cave',NULL,NULL,'Dark Cave, zipline, kayak','Ăn sáng, Ăn trưa, Ăn tối','Homestay',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(117,19,4,'Ngày 4: Phong Nha - Hà Nội',NULL,NULL,'Vườn thực vật, về Hà Nội','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(118,20,1,'Ngày 1: Hà Nội - Hạ Long',NULL,NULL,'Du thuyền Hạ Long, ngủ trên thuyền','Ăn trưa, Ăn tối','Du thuyền 3*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(119,20,2,'Ngày 2: Hạ Long - Yên Tử',NULL,NULL,'Bình minh, leo Yên Tử','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(120,20,3,'Ngày 3: Yên Tử - Hà Nội',NULL,NULL,'Chùa Đồng, về Hà Nội','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(121,21,1,'Ngày 1: Nha Trang - Bình Ba',NULL,NULL,'Tàu cao tốc ra đảo','Ăn trưa, Ăn tối','Homestay đảo',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(122,21,2,'Ngày 2: Bình Ba - Nha Trang',NULL,NULL,'Lặn biển, tôm hùm, về','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(123,22,1,'Ngày 1: Hà Nội - Côn Sơn - HN',NULL,NULL,'Chùa Côn Sơn, Kiếp Bạc, Bà Chúa Kho','Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(124,24,1,'Day 1: SG - Singapore',NULL,NULL,'Fly to SG, Marina Bay, Merlion','Lunch, Dinner','Hotel 4*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(125,24,2,'Day 2: Sentosa Island',NULL,NULL,'Sentosa, Universal Studios','Breakfast, Lunch, Dinner','Hotel 4*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(126,24,3,'Day 3: Gardens by the Bay',NULL,NULL,'Gardens, Cloud Forest, Shopping','Breakfast, Lunch, Dinner','Hotel 4*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(127,24,4,'Day 4: Singapore - SG',NULL,NULL,'Chinatown, fly home','Breakfast, Lunch',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(128,27,1,'Day 1: HCM - Bali',NULL,NULL,'Fly to Bali, Tanah Lot sunset','Lunch, Dinner','Resort 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(129,27,2,'Day 2: Ubud Explorer',NULL,NULL,'Tegalalang rice terrace, Monkey Forest','Breakfast, Lunch, Dinner','Resort 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(130,27,3,'Day 3: Nusa Dua Beach',NULL,NULL,'Water sports, beach relaxation','Breakfast, Lunch, Dinner','Resort 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(131,27,4,'Day 4: Mount Batur',NULL,NULL,'Sunrise trekking, hot spring','Breakfast, Lunch, Dinner','Resort 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(132,27,5,'Day 5: Seminyak - HCM',NULL,NULL,'Beach club, shopping, fly home','Breakfast, Lunch',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(133,28,1,'Day 1: HCM - Dubai',NULL,NULL,'Fly to Dubai, Burj Khalifa night','Lunch, Dinner','Hotel 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(134,28,2,'Day 2: Dubai City',NULL,NULL,'Dubai Mall, Palm Jumeirah, Dubai Marina','Breakfast, Lunch, Dinner','Hotel 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(135,28,3,'Day 3: Desert Safari',NULL,NULL,'Desert safari, BBQ dinner, belly dance','Breakfast, Lunch, Dinner','Hotel 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(136,28,4,'Day 4: Abu Dhabi',NULL,NULL,'Grand Mosque, Emirates Palace','Breakfast, Lunch, Dinner','Hotel 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(137,28,5,'Day 5: Dubai - HCM',NULL,NULL,'Gold Souk, fly home','Breakfast, Lunch',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(138,29,1,'Day 1: HCM - Maldives',NULL,NULL,'Fly to Maldives, seaplane to resort','Lunch, Dinner','Water Villa 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(139,29,2,'Day 2: Relax & Snorkeling',NULL,NULL,'Snorkeling, spa, sunset cruise','Breakfast, Lunch, Dinner','Water Villa 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(140,29,3,'Day 3: Island Hopping',NULL,NULL,'Visit local islands, sandbank picnic','Breakfast, Lunch, Dinner','Water Villa 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(141,29,4,'Day 4: Water Activities',NULL,NULL,'Diving, kayaking, fishing','Breakfast, Lunch, Dinner','Water Villa 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(142,29,5,'Day 5: Beach Day',NULL,NULL,'Private beach, underwater restaurant','Breakfast, Lunch, Dinner','Water Villa 5*',NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(143,29,6,'Day 6: Maldives - HCM',NULL,NULL,'Dolphin watching, fly home','Breakfast, Lunch',NULL,NULL,NULL,NULL,NULL,'2025-10-02 03:49:10','2025-10-02 03:49:10'),(185,30,6,'Day 6: Milan',NULL,NULL,'Duomo, Last Supper, Shopping','Breakfast, Lunch, Dinner','Hotel 4* Milan',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(186,30,7,'Day 7: Milan - Venice',NULL,NULL,'Train to Venice, Gondola ride','Breakfast, Lunch, Dinner','Hotel 4* Venice',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(187,30,8,'Day 8: Venice - Rome',NULL,NULL,'St Mark, train to Rome','Breakfast, Lunch, Dinner','Hotel 4* Rome',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(188,30,9,'Day 9: Rome',NULL,NULL,'Colosseum, Vatican, Trevi Fountain','Breakfast, Lunch, Dinner','Hotel 4* Rome',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(189,30,10,'Day 10: Rome - HN',NULL,NULL,'Shopping, fly home','Breakfast, Lunch',NULL,NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(190,30,1,'Day 1: HN - Paris',NULL,NULL,'Fly to Paris','Dinner','Hotel 4* Paris',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(191,30,2,'Day 2: Paris',NULL,NULL,'Eiffel Tower, Louvre, Seine cruise','Breakfast, Lunch, Dinner','Hotel 4* Paris',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(192,30,3,'Day 3: Paris - Zurich',NULL,NULL,'Versailles, train to Zurich','Breakfast, Lunch, Dinner','Hotel 4* Zurich',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(193,30,4,'Day 4: Swiss Alps',NULL,NULL,'Jungfraujoch, Interlaken','Breakfast, Lunch, Dinner','Hotel 4* Zurich',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(194,30,5,'Day 5: Zurich - Milan',NULL,NULL,'Lake Zurich, train to Milan','Breakfast, Lunch, Dinner','Hotel 4* Milan',NULL,NULL,NULL,NULL,'2025-10-07 15:04:00','2025-10-07 15:04:00'),(195,26,1,'Ngày 1: Hà Nội - Tokyo',NULL,NULL,'06:00: Bay từ Hà Nội đi Tokyo\n12:00: Đến Tokyo (giờ địa phương)\n14:00: Check-in khách sạn\n15:00: Ăn trưa Ramen\n16:00: Đền Sensoji Asakusa\n18:00: Tokyo Skytree\n19:30: Ăn tối Sushi\n21:00: Shibuya Crossing','Ăn trưa, Ăn tối','Khách sạn 4* Tokyo',NULL,NULL,29,30,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(196,26,2,'Ngày 2: Tokyo Disneyland',NULL,NULL,'07:00: Ăn sáng\n08:00: Tokyo Disneyland (cả ngày)\n12:00: Ăn trưa tại công viên\n18:00: Xem pháo hoa Disney\n19:30: Ăn tối Yakiniku\n21:00: Về khách sạn','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Tokyo',NULL,NULL,29,30,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(197,26,3,'Ngày 3: Tokyo - Núi Phú Sĩ',NULL,NULL,'07:00: Ăn sáng\n08:00: Khởi hành đi Phú Sĩ\n10:00: Tham quan 5 hồ Phú Sĩ\n12:00: Ăn trưa Houtou\n14:00: Cáp treo lên tầng 5 Phú Sĩ\n16:00: Onsen (tắm suối nước nóng)\n18:00: Ăn tối Shabu shabu\n20:00: Nghỉ tại ryokan','Ăn sáng, Ăn trưa, Ăn tối','Ryokan truyền thống',NULL,NULL,31,32,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(198,26,4,'Ngày 4: Phú Sĩ - Osaka',NULL,NULL,'07:00: Ăn sáng\n08:00: Shinkansen đi Osaka (3h)\n11:00: Đến Osaka, check-in\n12:00: Ăn trưa Takoyaki\n14:00: Osaka Castle\n16:00: Dotonbori\n18:00: Ăn tối Okonomiyaki\n20:00: Phố đêm Namba','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Osaka',NULL,NULL,33,34,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(199,26,5,'Ngày 5: Osaka - Kyoto - Osaka',NULL,NULL,'07:00: Ăn sáng\n08:00: Đi Kyoto (1h)\n09:00: Fushimi Inari (cổng đỏ)\n11:00: Chùa vàng Kinkaku-ji\n12:00: Ăn trưa Kaiseki\n14:00: Rừng tre Arashiyama\n17:00: Về Osaka\n18:30: Ăn tối Kobe beef\n20:30: Umeda Sky Building','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Osaka',NULL,NULL,33,34,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(200,26,6,'Ngày 6: Osaka - Hà Nội',NULL,NULL,'07:00: Ăn sáng\n08:00: Mua sắm tại Shinsaibashi\n11:00: Ăn trưa\n13:00: Ra sân bay\n15:00: Bay về Hà Nội\n19:00: Về đến Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,30,'2025-10-07 15:04:30','2025-10-07 15:04:30'),(201,23,1,'Ngày 1: TP.HCM - Bangkok',NULL,NULL,'06:00: Bay từ TP.HCM đi Bangkok\n08:00: Đến Bangkok (giờ địa phương)\n10:00: Tham quan Chùa Vàng\n12:00: Ăn trưa buffet quốc tế\n14:00: Cung điện Hoàng gia\n16:00: Check-in khách sạn\n18:00: Ăn tối buffet hải sản\n20:00: Chợ đêm Asiatique','Ăn trưa, Ăn tối','Khách sạn 4* Bangkok',NULL,NULL,23,24,'2025-10-08 06:43:09','2025-10-08 06:43:09'),(202,23,2,'Ngày 2: Bangkok - Pattaya',NULL,NULL,'07:00: Ăn sáng\n08:00: Khởi hành đi Pattaya (2h)\n10:00: Safari World (cả ngày)\n12:00: Ăn trưa tại Safari\n16:00: Check-in khách sạn Pattaya\n18:00: Ăn tối hải sản tươi sống\n20:00: Show Alcazar (nổi tiếng)','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Pattaya gần biển',NULL,NULL,25,26,'2025-10-08 06:43:09','2025-10-08 06:43:09'),(203,23,3,'Ngày 3: Tour đảo Coral + biển Pattaya',NULL,NULL,'07:00: Ăn sáng\n08:00: Du thuyền ra đảo Coral\n09:00: Lặn ngắm san hô, chơi dù bay\n12:00: Ăn trưa trên đảo\n14:00: Về bờ, tự do tắm biển\n18:00: Ăn tối BBQ buffet\n20:00: Walking Street Pattaya','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* Pattaya gần biển',NULL,NULL,25,26,'2025-10-08 06:43:09','2025-10-08 06:43:09'),(204,23,4,'Ngày 4: Pattaya - Bangkok - TP.HCM',NULL,NULL,'07:00: Ăn sáng\n08:00: Mua sắm tại Outlet Mall\n11:00: Ăn trưa\n13:00: Ra sân bay Bangkok\n15:30: Bay về TP.HCM\n17:00: Về đến TP.HCM, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,24,'2025-10-08 06:43:09','2025-10-08 06:43:09'),(213,2,1,'Ngày 1: Hà Nội - Sapa - Cát Cát',NULL,NULL,'21:00: Xe limousine đón tại Hà Nội\n05:00: Đến Sapa, ăn sáng\n07:00: Tham quan bản Cát Cát\n09:00: Thác Bạc, thác Tình Yêu\n12:00: Ăn trưa món Tây Bắc\n14:00: Check-in khách sạn, nghỉ ngơi\n16:00: Dạo phố, chợ tình Sapa\n18:30: Ăn tối buffet lẩu','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 3* view núi',NULL,NULL,5,6,'2025-10-19 05:58:54','2025-10-19 05:58:54'),(214,2,2,'Ngày 2: Chinh phục Fansipan',NULL,NULL,'07:00: Ăn sáng\n08:00: Di chuyển đến cáp treo Fansipan\n08:30: Chinh phục đỉnh Fansipan (3143m)\n11:30: Ăn trưa tại nhà hàng đỉnh Fansipan\n13:00: Xuống núi\n14:30: Khởi hành về Hà Nội\n22:00: Về đến Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,6,'2025-10-19 05:58:54','2025-10-19 05:58:54'),(215,3,1,'Ngày 1: TP.HCM - Đà Lạt',NULL,NULL,'05:00: Xe đón tại TP.HCM\n11:00: Đến Đà Lạt, check-in khách sạn\n12:00: Ăn trưa\n14:00: Tham quan Hồ Xuân Hương, Ga Đà Lạt\n16:00: Check-in cà phê view đẹp\n18:00: Dạo chợ đêm Đà Lạt\n19:00: Ăn tối lẩu bò','Ăn trưa, Ăn tối','Khách sạn 4* trung tâm',NULL,NULL,7,8,'2025-10-19 06:01:45','2025-10-19 06:01:45'),(216,3,2,'Ngày 2: Đà Lạt City Tour',NULL,NULL,'07:00: Ăn sáng\n08:00: Thác Datanla chơi trượt ống\n10:00: Hồ Tuyền Lâm, cáp treo\n12:00: Ăn trưa\n14:00: Nông trại dâu tây, vườn hoa\n16:00: Đồi chè Cầu Đất\n18:30: BBQ tự nướng','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 4* trung tâm',NULL,NULL,7,8,'2025-10-19 06:01:45','2025-10-19 06:01:45'),(217,3,3,'Ngày 3: Đà Lạt - TP.HCM',NULL,NULL,'06:00: Ăn sáng\n07:00: Tham quan Thiền viện Trúc Lâm\n09:00: Mua sắm đặc sản\n11:00: Ăn trưa\n12:30: Khởi hành về TP.HCM\n18:00: Về đến TP.HCM, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,8,'2025-10-19 06:01:45','2025-10-19 06:01:45'),(218,4,2,'Ngày 2: Mộc Châu - Sơn La',NULL,NULL,'Đồng cỏ Mộc Châu, di chuyển Sơn La, nhà tù Sơn La','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn Sơn La',NULL,NULL,NULL,NULL,'2025-10-19 06:02:37','2025-10-19 06:02:37'),(219,4,3,'Ngày 3: Sơn La - Điện Biên',NULL,NULL,'Đèo Pha Đin, đến Điện Biên, di tích lịch sử','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn Điện Biên',NULL,NULL,NULL,NULL,'2025-10-19 06:02:37','2025-10-19 06:02:37'),(220,4,4,'Ngày 4: Điện Biên Phủ',NULL,NULL,'Đồi A1, Hầm tướng De Castries, Bảo tàng Điện Biên','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn Điện Biên',NULL,NULL,NULL,NULL,'2025-10-19 06:02:37','2025-10-19 06:02:37'),(221,4,5,'Ngày 5: Điện Biên - Hà Nội',NULL,NULL,'Khởi hành về Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-19 06:02:37','2025-10-19 06:02:37'),(222,4,1,'Ngày 1: Hà Nội - Mộc Châu',NULL,NULL,'Khởi hành Hà Nội, đến Mộc Châu, tham quan đồi chè, thác Dải Yếm','Ăn trưa, Ăn tối','Homestay Mộc Châu',NULL,NULL,NULL,NULL,'2025-10-19 06:02:37','2025-10-19 06:02:37'),(223,5,1,'Ngày 1: TP.HCM - Buôn Ma Thuột',NULL,NULL,'Bay đến BMT, thác Dray Nur, làng cà phê','Ăn trưa, Ăn tối','Khách sạn 3*',NULL,NULL,NULL,NULL,'2025-10-19 06:19:56','2025-10-19 06:19:56'),(224,5,2,'Ngày 2: Buôn Đôn - Buôn Jang',NULL,NULL,'Làng voi, nhà sàn Ê Đê, biểu diễn cồng chiêng','Ăn sáng, Ăn trưa, Ăn tối','Homestay bản làng',NULL,NULL,NULL,NULL,'2025-10-19 06:19:56','2025-10-19 06:19:56'),(225,5,3,'Ngày 3: Hồ Lắk - Pleiku',NULL,NULL,'Biển Hồ, cưỡi voi, Pleiku','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn Pleiku',NULL,NULL,NULL,NULL,'2025-10-19 06:19:56','2025-10-19 06:19:56'),(226,5,4,'Ngày 4: Pleiku - TP.HCM',NULL,NULL,'Biển T\'Nưng, bay về TP.HCM','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-19 06:19:56','2025-10-19 06:19:56'),(227,6,1,'Ngày 1: Hà Nội - Đà Nẵng',NULL,NULL,'06:00: Bay từ Hà Nội đi Đà Nẵng\n08:30: Đón tại sân bay, tham quan Ngũ Hành Sơn\n10:30: Chùa Linh Ứng\n12:00: Ăn trưa hải sản\n14:00: Check-in resort, tắm biển Mỹ Khê\n18:00: Ăn tối BBQ seafood\n20:00: Ngắm cầu Rồng phun lửa','Ăn trưa, Ăn tối','Resort 4* gần biển',NULL,NULL,9,10,'2025-10-19 06:20:52','2025-10-19 06:20:52'),(228,6,2,'Ngày 2: Bà Nà Hills',NULL,NULL,'07:00: Ăn sáng\n08:00: Khởi hành đi Bà Nà Hills\n09:00: Cáp treo lên Bà Nà (dài nhất thế giới)\n10:00: Tham quan Cầu Vàng, chùa Linh Ứng Bà Nà\n12:00: Ăn trưa buffet tại Fantasy Park\n14:00: Vui chơi tại Fantasy Park (miễn phí)\n17:00: Xuống núi\n19:00: Ăn tối tại nhà hàng','Ăn sáng, Ăn trưa, Ăn tối','Resort 4* gần biển',NULL,NULL,9,10,'2025-10-19 06:20:52','2025-10-19 06:20:52'),(229,6,3,'Ngày 3: Hội An cổ kính',NULL,NULL,'07:00: Ăn sáng\n08:00: Đi Hội An\n09:00: Tham quan phố cổ, chùa Cầu\n11:00: May áo dài, làm đèn lồng\n12:00: Ăn trưa cao lầu, bánh bao bánh vạc\n14:00: Tham quan làng gốm Thanh Hà\n16:00: Check-in homestay view sông\n18:00: Ăn tối, thả đèn hoa đăng\n20:00: Dạo phố đêm Hội An','Ăn sáng, Ăn trưa, Ăn tối','Homestay 3* bên sông',NULL,NULL,11,12,'2025-10-19 06:20:52','2025-10-19 06:20:52'),(230,6,4,'Ngày 4: Đà Nẵng - Hà Nội',NULL,NULL,'06:00: Ăn sáng\n07:00: Dạo biển An Bàng\n09:00: Mua sắm đặc sản\n11:00: Ăn trưa\n13:00: Ra sân bay\n15:00: Bay về Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,10,'2025-10-19 06:20:52','2025-10-19 06:20:52'),(231,7,1,'Ngày 1: Đà Nẵng - Huế',NULL,NULL,'Đèo Hải Vân, Lăng Khải Định, Đại Nội','Ăn trưa, Ăn tối','Khách sạn 3* Huế',NULL,NULL,NULL,NULL,'2025-10-19 06:21:50','2025-10-19 06:21:50'),(232,7,2,'Ngày 2: Huế - Phong Nha',NULL,NULL,'Chùa Thiên Mụ, thuyền sông Hương, động Phong Nha','Ăn sáng, Ăn trưa, Ăn tối','Homestay Phong Nha',NULL,NULL,NULL,NULL,'2025-10-19 06:21:50','2025-10-19 06:21:50'),(233,7,3,'Ngày 3: Phong Nha - Đà Nẵng',NULL,NULL,'Paradise Cave, về Đà Nẵng','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,NULL,'2025-10-19 06:21:50','2025-10-19 06:21:50'),(234,1,1,'Ngày 1: Hà Nội - Hạ Long',NULL,NULL,'07:00: Xe và HDV đón tại điểm hẹn\n09:30: Dừng chân nghỉ ngơi tại Hải Dương\n12:00: Đến Hạ Long, check-in khách sạn, ăn trưa\n14:00: Tham quan Vịnh Hạ Long bằng du thuyền\n15:00: Thăm động Thiên Cung\n17:00: Ngắm hoàng hôn trên vịnh\n18:30: Ăn tối hải sản tươi sống\n20:00: Tự do khám phá chợ đêm Hạ Long','Ăn trưa, Ăn tối','Khách sạn 3* gần biển',NULL,NULL,1,2,'2025-10-19 06:30:41','2025-10-19 06:30:41'),(235,1,2,'Ngày 2: Hạ Long - Ninh Bình',NULL,NULL,'07:00: Ăn sáng tại khách sạn\n08:00: Khởi hành đi Ninh Bình\n10:30: Đến Ninh Bình, tham quan Tràng An\n12:00: Ăn trưa cơm dê núi đặc sản\n14:00: Leo Hang Múa ngắm toàn cảnh\n16:00: Check-in khách sạn\n18:00: Ăn tối, tự do dạo phố cổ','Ăn sáng, Ăn trưa, Ăn tối','Khách sạn 3* trung tâm',NULL,NULL,3,4,'2025-10-19 06:30:41','2025-10-19 06:30:41'),(236,1,3,'Ngày 3: Ninh Bình - Hà Nội',NULL,NULL,'06:00: Ăn sáng tại khách sạn\n07:00: Tham quan Tam Cốc bằng thuyền\n09:30: Viếng chùa Bái Đính\n12:00: Ăn trưa\n13:30: Khởi hành về Hà Nội\n16:00: Về đến Hà Nội, kết thúc tour','Ăn sáng, Ăn trưa',NULL,NULL,NULL,NULL,4,'2025-10-19 06:30:41','2025-10-19 06:30:41');
/*!40000 ALTER TABLE `tour_itineraries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_prices`
--

DROP TABLE IF EXISTS `tour_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_prices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adult_price` decimal(12,2) NOT NULL,
  `child_price` decimal(12,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `infant_price` decimal(12,2) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `season` enum('HIGH_SEASON','LOW_SEASON','NORMAL_SEASON','PEAK_SEASON') COLLATE utf8mb4_unicode_ci NOT NULL,
  `single_supplement` decimal(12,2) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `valid_from` date NOT NULL,
  `valid_to` date NOT NULL,
  `tour_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prices_tour` (`tour_id`),
  KEY `idx_prices_dates` (`valid_from`,`valid_to`),
  CONSTRAINT `FKc6k11qn9pgqsqve7bl7u77rpu` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_prices`
--

LOCK TABLES `tour_prices` WRITE;
/*!40000 ALTER TABLE `tour_prices` DISABLE KEYS */;
/*!40000 ALTER TABLE `tour_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `tour_ratings`
--

DROP TABLE IF EXISTS `tour_ratings`;
/*!50001 DROP VIEW IF EXISTS `tour_ratings`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `tour_ratings` AS SELECT 
 1 AS `tour_id`,
 1 AS `review_count`,
 1 AS `average_rating`,
 1 AS `five_star_count`,
 1 AS `four_star_count`,
 1 AS `three_star_count`,
 1 AS `two_star_count`,
 1 AS `one_star_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tour_schedules`
--

DROP TABLE IF EXISTS `tour_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint NOT NULL,
  `departure_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `total_seats` int NOT NULL,
  `available_seats` int NOT NULL,
  `adult_price` decimal(12,2) DEFAULT NULL,
  `child_price` decimal(12,2) DEFAULT NULL,
  `status` enum('AVAILABLE','FULL','CONFIRMED','CANCELLED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `booked_seats` int DEFAULT '0',
  `infant_price` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedules_tour_id` (`tour_id`),
  KEY `idx_schedules_departure_date` (`departure_date`),
  KEY `idx_schedules_status` (`status`),
  KEY `idx_schedules_tour` (`tour_id`),
  CONSTRAINT `tour_schedules_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_schedules`
--

LOCK TABLES `tour_schedules` WRITE;
/*!40000 ALTER TABLE `tour_schedules` DISABLE KEYS */;
INSERT INTO `tour_schedules` VALUES (1,1,'2025-10-05','2025-10-07',30,15,2490000.00,1743000.00,'AVAILABLE','Cuối tuần','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(2,1,'2025-10-12','2025-10-14',30,8,2490000.00,1743000.00,'AVAILABLE','Sắp đầy','2025-10-02 03:41:25','2025-10-15 16:15:11',22,NULL),(3,1,'2025-10-19','2025-10-21',30,20,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(4,1,'2025-10-26','2025-10-28',30,12,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',18,NULL),(5,1,'2025-11-02','2025-11-04',30,25,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(6,1,'2025-11-09','2025-11-11',30,18,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(7,1,'2025-11-16','2025-11-18',30,10,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(8,1,'2025-11-23','2025-11-25',30,5,2690000.00,1883000.00,'AVAILABLE','Lễ - giá cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(9,1,'2025-11-30','2025-12-02',30,22,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(10,1,'2025-12-07','2025-12-09',30,15,2690000.00,1883000.00,'AVAILABLE','Cao điểm cuối năm','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(11,1,'2025-12-14','2025-12-16',30,8,2690000.00,1883000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',22,NULL),(12,1,'2025-12-21','2025-12-23',30,0,2990000.00,2093000.00,'FULL','Giáng sinh - ĐÃ ĐẦY','2025-10-02 03:41:25','2025-10-15 16:15:11',30,NULL),(13,1,'2025-12-28','2025-12-30',30,0,3190000.00,2233000.00,'FULL','Tết Dương - ĐẦY','2025-10-02 03:41:25','2025-10-15 16:15:11',30,NULL),(14,1,'2026-01-04','2026-01-06',30,18,2490000.00,1743000.00,'AVAILABLE','Năm mới','2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(15,1,'2026-01-11','2026-01-13',30,20,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(16,1,'2026-01-18','2026-01-20',30,16,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',14,NULL),(17,1,'2026-01-25','2026-01-27',30,12,2890000.00,2023000.00,'AVAILABLE','Tết Âm lịch','2025-10-02 03:41:25','2025-10-15 16:15:11',18,NULL),(18,1,'2026-02-01','2026-02-03',30,22,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(19,2,'2025-10-05','2025-10-06',20,10,1890000.00,1323000.00,'AVAILABLE','Cuối tuần','2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(20,2,'2025-10-10','2025-10-11',20,15,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(21,2,'2025-10-17','2025-10-18',20,12,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(22,2,'2025-10-24','2025-10-25',20,8,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(23,2,'2025-10-31','2025-11-01',20,16,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',4,NULL),(24,2,'2025-11-07','2025-11-08',20,14,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(25,2,'2025-11-14','2025-11-15',20,10,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(26,2,'2025-11-21','2025-11-22',20,5,2090000.00,1463000.00,'AVAILABLE','Lễ - giá cao','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(27,2,'2025-11-28','2025-11-29',20,12,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(28,2,'2025-12-05','2025-12-06',20,8,2090000.00,1463000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(29,2,'2025-12-12','2025-12-13',20,6,2090000.00,1463000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',14,NULL),(30,2,'2025-12-19','2025-12-20',20,0,2290000.00,1603000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(31,2,'2025-12-26','2025-12-27',20,0,2490000.00,1743000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(32,2,'2026-01-02','2026-01-03',20,14,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(33,2,'2026-01-09','2026-01-10',20,16,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',4,NULL),(34,2,'2026-01-16','2026-01-17',20,12,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(35,2,'2026-01-23','2026-01-24',20,8,2290000.00,1603000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(36,2,'2026-01-30','2026-01-31',20,15,1890000.00,1323000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(37,3,'2025-10-06','2025-10-08',25,12,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(38,3,'2025-10-13','2025-10-15',25,18,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(39,3,'2025-10-20','2025-10-22',25,20,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(40,3,'2025-10-27','2025-10-29',25,15,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(41,3,'2025-11-03','2025-11-05',25,22,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(42,3,'2025-11-10','2025-11-12',25,16,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(43,3,'2025-11-17','2025-11-19',25,12,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(44,3,'2025-11-24','2025-11-26',25,8,2990000.00,2093000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(45,3,'2025-12-01','2025-12-03',25,14,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(46,3,'2025-12-08','2025-12-10',25,10,2990000.00,2093000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(47,3,'2025-12-15','2025-12-17',25,6,2990000.00,2093000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',19,NULL),(48,3,'2025-12-22','2025-12-24',25,0,3290000.00,2303000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(49,3,'2025-12-29','2025-12-31',25,0,3490000.00,2443000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(50,3,'2026-01-05','2026-01-07',25,18,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(51,3,'2026-01-12','2026-01-14',25,20,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(52,3,'2026-01-19','2026-01-21',25,16,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(53,3,'2026-01-26','2026-01-28',25,10,3290000.00,2303000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(54,3,'2026-02-02','2026-02-04',25,22,2790000.00,1953000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(55,4,'2025-10-08','2025-10-12',20,10,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(56,4,'2025-10-15','2025-10-19',20,14,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(57,4,'2025-10-22','2025-10-26',20,16,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',4,NULL),(58,4,'2025-10-29','2025-11-02',20,12,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(59,4,'2025-11-05','2025-11-09',20,18,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',2,NULL),(60,4,'2025-11-12','2025-11-16',20,15,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(61,4,'2025-11-19','2025-11-23',20,8,6890000.00,4823000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(62,4,'2025-11-26','2025-11-30',20,12,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(63,4,'2025-12-03','2025-12-07',20,10,6890000.00,4823000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(64,4,'2025-12-10','2025-12-14',20,6,6890000.00,4823000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',14,NULL),(65,4,'2025-12-17','2025-12-21',20,2,7290000.00,5103000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',18,NULL),(66,4,'2025-12-24','2025-12-28',20,0,7690000.00,5383000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(67,4,'2026-01-07','2026-01-11',20,16,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',4,NULL),(68,4,'2026-01-14','2026-01-18',20,18,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',2,NULL),(69,4,'2026-01-21','2026-01-25',20,12,7290000.00,5103000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(70,4,'2026-01-28','2026-02-01',20,14,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(71,5,'2025-10-07','2025-10-10',25,14,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(72,5,'2025-10-14','2025-10-17',25,18,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(73,5,'2025-10-21','2025-10-24',25,20,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(74,5,'2025-10-28','2025-10-31',25,16,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(75,5,'2025-11-04','2025-11-07',25,22,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(76,5,'2025-11-11','2025-11-14',25,15,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(77,5,'2025-11-18','2025-11-21',25,12,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(78,5,'2025-11-25','2025-11-28',25,8,5290000.00,3703000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(79,5,'2025-12-02','2025-12-05',25,16,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(80,5,'2025-12-09','2025-12-12',25,12,5290000.00,3703000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(81,5,'2025-12-16','2025-12-19',25,8,5290000.00,3703000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(82,5,'2025-12-23','2025-12-26',25,0,5690000.00,3983000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(83,5,'2025-12-30','2026-01-02',25,0,5990000.00,4193000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(84,5,'2026-01-06','2026-01-09',25,18,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(85,5,'2026-01-13','2026-01-16',25,20,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(86,5,'2026-01-20','2026-01-23',25,14,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(87,5,'2026-01-27','2026-01-30',25,10,5690000.00,3983000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(88,5,'2026-02-03','2026-02-06',25,22,4990000.00,3493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(89,6,'2025-10-06','2025-10-09',25,12,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(90,6,'2025-10-13','2025-10-16',25,18,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(91,6,'2025-10-20','2025-10-23',25,20,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(92,6,'2025-10-27','2025-10-30',25,16,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(93,6,'2025-11-03','2025-11-06',25,22,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(94,6,'2025-11-10','2025-11-13',25,15,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(95,6,'2025-11-17','2025-11-20',25,12,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(96,6,'2025-11-24','2025-11-27',25,8,3790000.00,2653000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(97,6,'2025-12-01','2025-12-04',25,16,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(98,6,'2025-12-08','2025-12-11',25,12,3790000.00,2653000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(99,6,'2025-12-15','2025-12-18',25,6,3790000.00,2653000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',19,NULL),(100,6,'2025-12-22','2025-12-25',25,0,4190000.00,2933000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(101,6,'2025-12-29','2026-01-01',25,0,4490000.00,3143000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(102,6,'2026-01-05','2026-01-08',25,18,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(103,6,'2026-01-12','2026-01-15',25,20,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(104,6,'2026-01-19','2026-01-22',25,16,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(105,6,'2026-01-26','2026-01-29',25,10,4190000.00,2933000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(106,6,'2026-02-02','2026-02-05',25,22,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(107,7,'2025-10-05','2025-10-07',25,14,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(108,7,'2025-10-12','2025-10-14',25,18,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(109,7,'2025-10-19','2025-10-21',25,20,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(110,7,'2025-10-26','2025-10-28',25,16,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(111,7,'2025-11-02','2025-11-04',25,22,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(112,7,'2025-11-09','2025-11-11',25,15,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(113,7,'2025-11-16','2025-11-18',25,12,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(114,7,'2025-11-23','2025-11-25',25,8,3590000.00,2513000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(115,7,'2025-11-30','2025-12-02',25,16,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(116,7,'2025-12-07','2025-12-09',25,12,3590000.00,2513000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(117,7,'2025-12-14','2025-12-16',25,8,3590000.00,2513000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(118,7,'2025-12-21','2025-12-23',25,0,3890000.00,2723000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(119,7,'2025-12-28','2025-12-30',25,0,4190000.00,2933000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(120,7,'2026-01-04','2026-01-06',25,18,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(121,7,'2026-01-11','2026-01-13',25,20,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(122,7,'2026-01-18','2026-01-20',25,16,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(123,7,'2026-01-25','2026-01-27',25,10,3890000.00,2723000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(124,7,'2026-02-01','2026-02-03',25,22,3290000.00,2303000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(125,8,'2025-10-06','2025-10-08',25,14,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(126,8,'2025-10-13','2025-10-15',25,18,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(127,8,'2025-10-20','2025-10-22',25,20,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(128,8,'2025-10-27','2025-10-29',25,16,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(129,8,'2025-11-03','2025-11-05',25,22,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(130,8,'2025-11-10','2025-11-12',25,15,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(131,8,'2025-11-17','2025-11-19',25,12,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(132,8,'2025-11-24','2025-11-26',25,8,2590000.00,1813000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(133,8,'2025-12-01','2025-12-03',25,16,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(134,8,'2025-12-08','2025-12-10',25,12,2590000.00,1813000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(135,8,'2025-12-15','2025-12-17',25,8,2590000.00,1813000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(136,8,'2025-12-22','2025-12-24',25,0,2890000.00,2023000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(137,8,'2025-12-29','2025-12-31',25,0,3090000.00,2163000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(138,8,'2026-01-05','2026-01-07',25,18,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(139,8,'2026-01-12','2026-01-14',25,20,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(140,8,'2026-01-19','2026-01-21',25,16,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(141,8,'2026-01-26','2026-01-28',25,10,2890000.00,2023000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(142,8,'2026-02-02','2026-02-04',25,22,2390000.00,1673000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(143,9,'2025-10-05','2025-10-07',30,16,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',14,NULL),(144,9,'2025-10-12','2025-10-14',30,20,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(145,9,'2025-10-19','2025-10-21',30,22,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(146,9,'2025-10-26','2025-10-28',30,18,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(147,9,'2025-11-02','2025-11-04',30,24,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(148,9,'2025-11-09','2025-11-11',30,16,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',14,NULL),(149,9,'2025-11-16','2025-11-18',30,14,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',16,NULL),(150,9,'2025-11-23','2025-11-25',30,10,3490000.00,2443000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(151,9,'2025-11-30','2025-12-02',30,18,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(152,9,'2025-12-07','2025-12-09',30,14,3490000.00,2443000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',16,NULL),(153,9,'2025-12-14','2025-12-16',30,10,3490000.00,2443000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',20,NULL),(154,9,'2025-12-21','2025-12-23',30,0,3790000.00,2653000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',30,NULL),(155,9,'2025-12-28','2025-12-30',30,0,4090000.00,2863000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',30,NULL),(156,9,'2026-01-04','2026-01-06',30,20,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(157,9,'2026-01-11','2026-01-13',30,22,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',8,NULL),(158,9,'2026-01-18','2026-01-20',30,18,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',12,NULL),(159,9,'2026-01-25','2026-01-27',30,12,3790000.00,2653000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',18,NULL),(160,9,'2026-02-01','2026-02-03',30,24,3190000.00,2233000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',6,NULL),(161,10,'2025-10-07','2025-10-10',25,14,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',11,NULL),(162,10,'2025-10-14','2025-10-17',25,18,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(163,10,'2025-10-21','2025-10-24',25,20,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(164,10,'2025-10-28','2025-10-31',25,16,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(165,10,'2025-11-04','2025-11-07',25,22,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(166,10,'2025-11-11','2025-11-14',25,15,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',10,NULL),(167,10,'2025-11-18','2025-11-21',25,12,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(168,10,'2025-11-25','2025-11-28',25,8,5790000.00,4053000.00,'AVAILABLE','Lễ','2025-10-02 03:41:25','2025-10-15 16:15:11',17,NULL),(169,10,'2025-12-02','2025-12-05',25,16,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(170,10,'2025-12-09','2025-12-12',25,12,5790000.00,4053000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:25','2025-10-15 16:15:11',13,NULL),(171,10,'2025-12-16','2025-12-19',25,6,5790000.00,4053000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',19,NULL),(172,10,'2025-12-23','2025-12-26',25,0,6390000.00,4473000.00,'FULL','Giáng sinh','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(173,10,'2025-12-30','2026-01-02',25,0,6790000.00,4753000.00,'FULL','Tết Dương','2025-10-02 03:41:25','2025-10-15 16:15:11',25,NULL),(174,10,'2026-01-06','2026-01-09',25,18,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',7,NULL),(175,10,'2026-01-13','2026-01-16',25,20,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',5,NULL),(176,10,'2026-01-20','2026-01-23',25,16,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',9,NULL),(177,10,'2026-01-27','2026-01-30',25,10,6390000.00,4473000.00,'AVAILABLE','Tết','2025-10-02 03:41:25','2025-10-15 16:15:11',15,NULL),(178,10,'2026-02-03','2026-02-06',25,22,5390000.00,3773000.00,'AVAILABLE',NULL,'2025-10-02 03:41:25','2025-10-15 16:15:11',3,NULL),(179,11,'2025-10-08','2025-10-10',20,12,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(180,11,'2025-10-15','2025-10-17',20,16,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(181,11,'2025-10-22','2025-10-24',20,18,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(182,11,'2025-10-29','2025-10-31',20,14,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(183,11,'2025-11-05','2025-11-07',20,16,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(184,11,'2025-11-12','2025-11-14',20,12,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(185,11,'2025-11-19','2025-11-21',20,8,6890000.00,4823000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(186,11,'2025-11-26','2025-11-28',20,14,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(187,11,'2025-12-03','2025-12-05',20,10,6890000.00,4823000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(188,11,'2025-12-10','2025-12-12',20,6,6890000.00,4823000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(189,11,'2025-12-17','2025-12-19',20,2,7290000.00,5103000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',18,NULL),(190,11,'2025-12-24','2025-12-26',20,0,7690000.00,5383000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(191,11,'2026-01-07','2026-01-09',20,16,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(192,11,'2026-01-14','2026-01-16',20,18,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(193,11,'2026-01-21','2026-01-23',20,12,7290000.00,5103000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(194,11,'2026-01-28','2026-01-30',20,14,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(195,12,'2025-10-06','2025-10-08',25,14,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(196,12,'2025-10-13','2025-10-15',25,18,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(197,12,'2025-10-20','2025-10-22',25,20,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(198,12,'2025-10-27','2025-10-29',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(199,12,'2025-11-03','2025-11-05',25,22,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(200,12,'2025-11-10','2025-11-12',25,15,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(201,12,'2025-11-17','2025-11-19',25,12,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(202,12,'2025-11-24','2025-11-26',25,8,2490000.00,1743000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(203,12,'2025-12-01','2025-12-03',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(204,12,'2025-12-08','2025-12-10',25,12,2490000.00,1743000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(205,12,'2025-12-15','2025-12-17',25,8,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(206,12,'2025-12-22','2025-12-24',25,0,2790000.00,1953000.00,'FULL','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(207,12,'2025-12-29','2025-12-31',25,0,2990000.00,2093000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(208,12,'2026-01-05','2026-01-07',25,18,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(209,12,'2026-01-12','2026-01-14',25,20,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(210,12,'2026-01-19','2026-01-21',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(211,12,'2026-01-26','2026-01-28',25,10,2790000.00,1953000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(212,12,'2026-02-02','2026-02-04',25,22,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(213,13,'2025-10-05','2025-10-06',25,14,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(214,13,'2025-10-10','2025-10-11',25,18,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(215,13,'2025-10-17','2025-10-18',25,20,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(216,13,'2025-10-24','2025-10-25',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(217,13,'2025-10-31','2025-11-01',25,22,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(218,13,'2025-11-07','2025-11-08',25,15,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(219,13,'2025-11-14','2025-11-15',25,12,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(220,13,'2025-11-21','2025-11-22',25,8,2490000.00,1743000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(221,13,'2025-11-28','2025-11-29',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(222,13,'2025-12-05','2025-12-06',25,12,2490000.00,1743000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(223,13,'2025-12-12','2025-12-13',25,8,2490000.00,1743000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(224,13,'2025-12-19','2025-12-20',25,0,2690000.00,1883000.00,'FULL','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(225,13,'2025-12-26','2025-12-27',25,0,2890000.00,2023000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(226,13,'2026-01-02','2026-01-03',25,18,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(227,13,'2026-01-09','2026-01-10',25,20,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(228,13,'2026-01-16','2026-01-17',25,16,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(229,13,'2026-01-23','2026-01-24',25,10,2690000.00,1883000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(230,13,'2026-01-30','2026-01-31',25,22,2290000.00,1603000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(231,14,'2025-10-04','2025-10-04',30,16,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(232,14,'2025-10-11','2025-10-11',30,20,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(233,14,'2025-10-18','2025-10-18',30,22,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(234,14,'2025-10-25','2025-10-25',30,18,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(235,14,'2025-11-01','2025-11-01',30,24,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(236,14,'2025-11-08','2025-11-08',30,16,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(237,14,'2025-11-15','2025-11-15',30,14,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(238,14,'2025-11-22','2025-11-22',30,10,1690000.00,1183000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(239,14,'2025-11-29','2025-11-29',30,18,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(240,14,'2025-12-06','2025-12-06',30,14,1690000.00,1183000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(241,14,'2025-12-13','2025-12-13',30,10,1690000.00,1183000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(242,14,'2025-12-20','2025-12-20',30,0,1890000.00,1323000.00,'FULL','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',30,NULL),(243,14,'2025-12-27','2025-12-27',30,0,1990000.00,1393000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',30,NULL),(244,14,'2026-01-03','2026-01-03',30,20,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(245,14,'2026-01-10','2026-01-10',30,22,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(246,14,'2026-01-17','2026-01-17',30,18,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(247,14,'2026-01-24','2026-01-24',30,12,1890000.00,1323000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',18,NULL),(248,14,'2026-01-31','2026-01-31',30,24,1490000.00,1043000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(249,15,'2025-10-05','2025-10-06',20,10,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(250,15,'2025-10-12','2025-10-13',20,14,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(251,15,'2025-10-19','2025-10-20',20,16,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(252,15,'2025-10-26','2025-10-27',20,12,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(253,15,'2025-11-02','2025-11-03',20,18,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(254,15,'2025-11-09','2025-11-10',20,14,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(255,15,'2025-11-16','2025-11-17',20,10,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(256,15,'2025-11-23','2025-11-24',20,6,2190000.00,1533000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(257,15,'2025-11-30','2025-12-01',20,12,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(258,15,'2025-12-07','2025-12-08',20,8,2190000.00,1533000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(259,15,'2025-12-14','2025-12-15',20,6,2190000.00,1533000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(260,15,'2025-12-21','2025-12-22',20,0,2390000.00,1673000.00,'FULL','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(261,15,'2025-12-28','2025-12-29',20,0,2590000.00,1813000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(262,15,'2026-01-04','2026-01-05',20,16,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(263,15,'2026-01-11','2026-01-12',20,18,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(264,15,'2026-01-18','2026-01-19',20,12,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(265,15,'2026-01-25','2026-01-26',20,8,2390000.00,1673000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(266,15,'2026-02-01','2026-02-02',20,16,1990000.00,1393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(267,16,'2025-10-08','2025-10-11',15,8,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(268,16,'2025-10-15','2025-10-18',15,12,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(269,16,'2025-10-22','2025-10-25',15,14,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',1,NULL),(270,16,'2025-10-29','2025-11-01',15,10,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(271,16,'2025-11-05','2025-11-08',15,12,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(272,16,'2025-11-12','2025-11-15',15,8,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(273,16,'2025-11-19','2025-11-22',15,6,4290000.00,3003000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(274,16,'2025-11-26','2025-11-29',15,10,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(275,16,'2025-12-03','2025-12-06',15,8,4290000.00,3003000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(276,16,'2025-12-10','2025-12-13',15,4,4290000.00,3003000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(277,16,'2025-12-17','2025-12-20',15,2,4590000.00,3213000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(278,16,'2025-12-24','2025-12-27',15,0,4890000.00,3423000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(279,16,'2026-01-07','2026-01-10',15,12,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(280,16,'2026-01-14','2026-01-17',15,14,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',1,NULL),(281,16,'2026-01-21','2026-01-24',15,8,4590000.00,3213000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(282,16,'2026-01-28','2026-01-31',15,10,3990000.00,2793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(283,23,'2025-10-10','2025-10-13',30,16,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(284,23,'2025-10-17','2025-10-20',30,20,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(285,23,'2025-10-24','2025-10-27',30,22,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(286,23,'2025-10-31','2025-11-03',30,18,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(287,23,'2025-11-07','2025-11-10',30,24,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(288,23,'2025-11-14','2025-11-17',30,16,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',14,NULL),(289,23,'2025-11-21','2025-11-24',30,12,6490000.00,4543000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',18,NULL),(290,23,'2025-11-28','2025-12-01',30,18,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(291,23,'2025-12-05','2025-12-08',30,14,6490000.00,4543000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(292,23,'2025-12-12','2025-12-15',30,10,6490000.00,4543000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(293,23,'2025-12-19','2025-12-22',30,6,6990000.00,4893000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',24,NULL),(294,23,'2025-12-26','2025-12-29',30,0,7490000.00,5243000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',30,NULL),(295,23,'2026-01-09','2026-01-12',30,20,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(296,23,'2026-01-16','2026-01-19',30,22,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(297,23,'2026-01-23','2026-01-26',30,14,6990000.00,4893000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(298,23,'2026-01-30','2026-02-02',30,24,5940000.00,4158000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(299,24,'2025-10-12','2025-10-15',25,14,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(300,24,'2025-10-19','2025-10-22',25,18,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(301,24,'2025-10-26','2025-10-29',25,20,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(302,24,'2025-11-02','2025-11-05',25,16,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(303,24,'2025-11-09','2025-11-12',25,22,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(304,24,'2025-11-16','2025-11-19',25,14,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(305,24,'2025-11-23','2025-11-26',25,10,8790000.00,6153000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(306,24,'2025-11-30','2025-12-03',25,16,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(307,24,'2025-12-07','2025-12-10',25,12,8790000.00,6153000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(308,24,'2025-12-14','2025-12-17',25,8,8790000.00,6153000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(309,24,'2025-12-21','2025-12-24',25,4,9490000.00,6643000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',21,NULL),(310,24,'2025-12-28','2025-12-31',25,0,9990000.00,6993000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(311,24,'2026-01-11','2026-01-14',25,18,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(312,24,'2026-01-18','2026-01-21',25,20,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(313,24,'2026-01-25','2026-01-28',25,12,9490000.00,6643000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(314,24,'2026-02-01','2026-02-04',25,22,8090000.00,5663000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(315,25,'2025-10-14','2025-10-18',25,14,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(316,25,'2025-10-21','2025-10-25',25,18,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(317,25,'2025-10-28','2025-11-01',25,20,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(318,25,'2025-11-04','2025-11-08',25,16,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(319,25,'2025-11-11','2025-11-15',25,22,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(320,25,'2025-11-18','2025-11-22',25,14,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(321,25,'2025-11-25','2025-11-29',25,10,12430000.00,8701000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(322,25,'2025-12-02','2025-12-06',25,16,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(323,25,'2025-12-09','2025-12-13',25,12,12430000.00,8701000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(324,25,'2025-12-16','2025-12-20',25,8,12430000.00,8701000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(325,25,'2025-12-23','2025-12-27',25,4,13430000.00,9401000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',21,NULL),(326,25,'2025-12-30','2026-01-03',25,0,14430000.00,10101000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(327,25,'2026-01-13','2026-01-17',25,18,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(328,25,'2026-01-20','2026-01-24',25,20,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(329,25,'2026-01-27','2026-01-31',25,12,13430000.00,9401000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(330,25,'2026-02-03','2026-02-07',25,22,11430000.00,8001000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(331,26,'2025-10-16','2025-10-21',20,12,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(332,26,'2025-10-23','2025-10-28',20,16,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(333,26,'2025-10-30','2025-11-04',20,18,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(334,26,'2025-11-06','2025-11-11',20,14,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(335,26,'2025-11-13','2025-11-18',20,16,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(336,26,'2025-11-20','2025-11-25',20,10,23990000.00,16793000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(337,26,'2025-11-27','2025-12-02',20,14,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(338,26,'2025-12-04','2025-12-09',20,12,23990000.00,16793000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(339,26,'2025-12-11','2025-12-16',20,8,23990000.00,16793000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(340,26,'2025-12-18','2025-12-23',20,4,25990000.00,18193000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(341,26,'2025-12-25','2025-12-30',20,0,27990000.00,19593000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(342,26,'2026-01-08','2026-01-13',20,16,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(343,26,'2026-01-15','2026-01-20',20,18,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(344,26,'2026-01-22','2026-01-27',20,10,25990000.00,18193000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(345,26,'2026-01-29','2026-02-03',20,14,21990000.00,15393000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(346,27,'2025-10-13','2025-10-17',25,14,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(347,27,'2025-10-20','2025-10-24',25,18,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(348,27,'2025-10-27','2025-10-31',25,20,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(349,27,'2025-11-03','2025-11-07',25,16,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(350,27,'2025-11-10','2025-11-14',25,22,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(351,27,'2025-11-17','2025-11-21',25,14,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(352,27,'2025-11-24','2025-11-28',25,10,9990000.00,6993000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(353,27,'2025-12-01','2025-12-05',25,16,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(354,27,'2025-12-08','2025-12-12',25,12,9990000.00,6993000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(355,27,'2025-12-15','2025-12-19',25,8,9990000.00,6993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(356,27,'2025-12-22','2025-12-26',25,4,10990000.00,7693000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',21,NULL),(357,27,'2025-12-29','2026-01-02',25,0,11990000.00,8393000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(358,27,'2026-01-12','2026-01-16',25,18,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(359,27,'2026-01-19','2026-01-23',25,20,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(360,27,'2026-01-26','2026-01-30',25,12,10990000.00,7693000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(361,27,'2026-02-02','2026-02-06',25,22,9090000.00,6363000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(362,28,'2025-10-15','2025-10-19',20,12,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(363,28,'2025-10-22','2025-10-26',20,16,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(364,28,'2025-10-29','2025-11-02',20,18,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(365,28,'2025-11-05','2025-11-09',20,14,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(366,28,'2025-11-12','2025-11-16',20,16,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(367,28,'2025-11-19','2025-11-23',20,10,15990000.00,11193000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(368,28,'2025-11-26','2025-11-30',20,14,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(369,28,'2025-12-03','2025-12-07',20,12,15990000.00,11193000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(370,28,'2025-12-10','2025-12-14',20,8,15990000.00,11193000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(371,28,'2025-12-17','2025-12-21',20,4,17490000.00,12243000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(372,28,'2025-12-24','2025-12-28',20,0,18990000.00,13293000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(373,28,'2026-01-07','2026-01-11',20,16,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(374,28,'2026-01-14','2026-01-18',20,18,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(375,28,'2026-01-21','2026-01-25',20,10,17490000.00,12243000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(376,28,'2026-01-28','2026-02-01',20,14,14710000.00,10297000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(377,29,'2025-10-17','2025-10-22',20,12,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(378,29,'2025-10-24','2025-10-29',20,16,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(379,29,'2025-10-31','2025-11-05',20,18,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(380,29,'2025-11-07','2025-11-12',20,14,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(381,29,'2025-11-14','2025-11-19',20,16,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(382,29,'2025-11-21','2025-11-26',20,10,32990000.00,23093000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(383,29,'2025-11-28','2025-12-03',20,14,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(384,29,'2025-12-05','2025-12-10',20,12,32990000.00,23093000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',8,NULL),(385,29,'2025-12-12','2025-12-17',20,8,32990000.00,23093000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',12,NULL),(386,29,'2025-12-19','2025-12-24',20,4,35990000.00,25193000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',16,NULL),(387,29,'2025-12-26','2025-12-31',20,0,38990000.00,27293000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',20,NULL),(388,29,'2026-01-09','2026-01-14',20,16,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',4,NULL),(389,29,'2026-01-16','2026-01-21',20,18,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',2,NULL),(390,29,'2026-01-23','2026-01-28',20,10,35990000.00,25193000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',10,NULL),(391,29,'2026-01-30','2026-02-04',20,14,29990000.00,20993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',6,NULL),(392,30,'2025-10-20','2025-10-29',25,14,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(393,30,'2025-10-27','2025-11-05',25,18,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(394,30,'2025-11-03','2025-11-12',25,20,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(395,30,'2025-11-10','2025-11-19',25,16,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(396,30,'2025-11-17','2025-11-26',25,22,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL),(397,30,'2025-11-24','2025-12-03',25,14,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',11,NULL),(398,30,'2025-12-01','2025-12-10',25,10,49990000.00,34993000.00,'AVAILABLE','Lễ','2025-10-02 03:41:50','2025-10-15 16:15:11',15,NULL),(399,30,'2025-12-08','2025-12-17',25,16,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',9,NULL),(400,30,'2025-12-15','2025-12-24',25,12,49990000.00,34993000.00,'AVAILABLE','Cao điểm','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(401,30,'2025-12-22','2025-12-31',25,8,49990000.00,34993000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',17,NULL),(402,30,'2025-12-29','2026-01-07',25,4,54990000.00,38493000.00,'AVAILABLE','Giáng sinh','2025-10-02 03:41:50','2025-10-15 16:15:11',21,NULL),(403,30,'2026-01-05','2026-01-14',25,0,59990000.00,41993000.00,'FULL','Tết Dương','2025-10-02 03:41:50','2025-10-15 16:15:11',25,NULL),(404,30,'2026-01-12','2026-01-21',25,18,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',7,NULL),(405,30,'2026-01-19','2026-01-28',25,20,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',5,NULL),(406,30,'2026-01-26','2026-02-04',25,12,54990000.00,38493000.00,'AVAILABLE','Tết','2025-10-02 03:41:50','2025-10-15 16:15:11',13,NULL),(407,30,'2026-02-02','2026-02-11',25,22,44990000.00,31493000.00,'AVAILABLE',NULL,'2025-10-02 03:41:50','2025-10-15 16:15:11',3,NULL);
/*!40000 ALTER TABLE `tour_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `tour_statistics`
--

DROP TABLE IF EXISTS `tour_statistics`;
/*!50001 DROP VIEW IF EXISTS `tour_statistics`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `tour_statistics` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `tour_type`,
 1 AS `region`,
 1 AS `status`,
 1 AS `total_bookings`,
 1 AS `paid_bookings`,
 1 AS `cancelled_bookings`,
 1 AS `average_rating`,
 1 AS `review_count`,
 1 AS `view_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tour_target_audience`
--

DROP TABLE IF EXISTS `tour_target_audience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_target_audience` (
  `tour_id` bigint NOT NULL,
  `target_audience_id` bigint NOT NULL,
  PRIMARY KEY (`tour_id`,`target_audience_id`),
  KEY `target_audience_id` (`target_audience_id`),
  CONSTRAINT `tour_target_audience_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tour_target_audience_ibfk_2` FOREIGN KEY (`target_audience_id`) REFERENCES `target_audiences` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_target_audience`
--

LOCK TABLES `tour_target_audience` WRITE;
/*!40000 ALTER TABLE `tour_target_audience` DISABLE KEYS */;
/*!40000 ALTER TABLE `tour_target_audience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tours`
--

DROP TABLE IF EXISTS `tours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `highlights` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `child_price` decimal(12,2) DEFAULT NULL,
  `infant_price` decimal(12,2) DEFAULT NULL,
  `duration` int NOT NULL,
  `min_people` int DEFAULT '1',
  `max_people` int NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `tour_type` enum('DOMESTIC','INTERNATIONAL') COLLATE utf8mb4_unicode_ci DEFAULT 'DOMESTIC',
  `departure_location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destinations` text COLLATE utf8mb4_unicode_ci,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transportation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accommodation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meals_included` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `included_services` text COLLATE utf8mb4_unicode_ci,
  `excluded_services` text COLLATE utf8mb4_unicode_ci,
  `visa_required` tinyint(1) DEFAULT '0',
  `visa_info` text COLLATE utf8mb4_unicode_ci,
  `flight_included` tinyint(1) DEFAULT '0',
  `cancellation_policy` text COLLATE utf8mb4_unicode_ci,
  `note` text COLLATE utf8mb4_unicode_ci,
  `suitable_for` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `main_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `is_featured` tinyint(1) DEFAULT '0',
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `country_id` bigint DEFAULT NULL,
  `average_rating` double DEFAULT NULL,
  `review_count` bigint DEFAULT '0' COMMENT 'Cached count of approved reviews',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `weather_enabled` tinyint(1) DEFAULT '1' COMMENT 'Bật/tắt hiển thị thời tiết',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_tours_slug` (`slug`),
  KEY `idx_tours_category_id` (`category_id`),
  KEY `idx_tours_tour_type` (`tour_type`),
  KEY `idx_tours_departure_location` (`departure_location`),
  KEY `idx_tours_destination` (`destination`),
  KEY `idx_tours_region` (`region`),
  KEY `idx_tours_country_code` (`country_code`),
  KEY `idx_tours_price` (`price`),
  KEY `idx_tours_status` (`status`),
  KEY `idx_tours_is_featured` (`is_featured`),
  KEY `idx_tours_category` (`category_id`),
  KEY `idx_tours_featured` (`is_featured`),
  KEY `idx_tours_category_status` (`category_id`,`status`),
  KEY `FKjdswxmcp4k68vndoavsjh8t2j` (`country_id`),
  KEY `idx_tours_rating` (`average_rating` DESC),
  FULLTEXT KEY `idx_tours_search` (`name`,`short_description`,`description`),
  CONSTRAINT `FKjdswxmcp4k68vndoavsjh8t2j` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`),
  CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tours`
--

LOCK TABLES `tours` WRITE;
/*!40000 ALTER TABLE `tours` DISABLE KEYS */;
INSERT INTO `tours` VALUES (1,'Hà Nội - Hạ Long - Ninh Bình 3N2Đ','ha-noi-ha-long-ninh-binh-3n2d','Khám phá ba điểm đến nổi tiếng miền Bắc','Tour trọn gói khám phá Vịnh Hạ Long kỳ vĩ, Tràng An Ninh Bình thơ mộng và Hà Nội ngàn năm văn hiến. Tham quan các di tích lịch sử, thưởng thức ẩm thực đặc sản.','',2890000.00,2490000.00,1743000.00,NULL,3,4,30,6,'DOMESTIC','Hà Nội','Hạ Long - Ninh Bình','Hà Nội,Hạ Long,Ninh Bình','Miền Bắc',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'http://localhost:8080/uploads/1b21b498-3e02-4d49-b2fa-c4e6aaa5794d.jpg','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,4.6667,3,20.2506,105.9745,1),(2,'Sapa - Fansipan - Cát Cát 2N3Đ','sapa-fansipan-cat-cat-2n3d','Chinh phục nóc nhà Đông Dương','Trekking chinh phục đỉnh Fansipan bằng cáp treo, khám phá bản Cát Cát, thưởng ngoạn ruộng bậc thang, trải nghiệm văn hóa dân tộc thiểu số.','',1890000.00,NULL,1323000.00,NULL,2,4,20,2,'DOMESTIC','Hà Nội','Sapa','Lào Cai,Sapa,Fansipan','Miền Bắc',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,5,2,22.3364,103.8438,1),(3,'Đà Lạt - Thành phố ngàn hoa 3N2Đ','da-lat-thanh-pho-ngan-hoa-3n2d','Lãng mạn thành phố sương mù','Tham quan thác Datanla, Hồ Tuyền Lâm, check-in cà phê đẹp, đi dạo Hồ Xuân Hương, chợ đêm Đà Lạt, nông trại dâu tây.','',2790000.00,NULL,1953000.00,NULL,3,4,25,5,'DOMESTIC','TP.HCM','Đà Lạt','Lâm Đồng,Đà Lạt','Miền Nam',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,4.6667,3,11.9404,108.4583,1),(4,'Tây Bắc - Điện Biên - Mộc Châu 5N4Đ','tay-bac-dien-bien-moc-chau-5n4d','Hành trình chinh phục Tây Bắc','Tour khám phá vùng Tây Bắc hùng vĩ: Điện Biên Phủ anh hùng, Mộc Châu thơ mộng, Sơn La núi rừng hùng vĩ, trải nghiệm văn hóa dân tộc.','',6890000.00,6490000.00,4543000.00,NULL,5,6,20,8,'DOMESTIC','Hà Nội','Điện Biên - Mộc Châu','Điện Biên,Sơn La,Mộc Châu','Miền Bắc',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-18 23:02:38',NULL,NULL,0,0,NULL,NULL,1),(5,'Tây Nguyên - Buôn Ma Thuột 4N3Đ','tay-nguyen-buon-ma-thuot-4n3d','Vùng đất huyền thoại','Khám phá vùng đất Tây Nguyên với cà phê nguyên chất, thác Dray Nur hùng vĩ, biển Hồ thơ mộng, văn hóa cồng chiêng độc đáo.','',4990000.00,NULL,3493000.00,NULL,4,4,25,3,'DOMESTIC','TP.HCM','Buôn Ma Thuột','Đắk Lắk,Buôn Ma Thuột','Miền Trung',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-18 23:19:57',NULL,NULL,0,0,NULL,NULL,1),(6,'Đà Nẵng - Hội An - Bà Nà 4N3Đ','da-nang-hoi-an-ba-na-4n3d','Biển xanh cát trắng phố cổ','Tour trọn gói khám phá Đà Nẵng hiện đại, phố cổ Hội An cổ kính, Sun World Bà Nà Hills với Cầu Vàng nổi tiếng. Tắm biển Mỹ Khê, check-in sống ảo.','',3990000.00,3490000.00,2443000.00,NULL,4,4,25,1,'DOMESTIC','Hà Nội','Đà Nẵng - Hội An','Đà Nẵng,Hội An,Bà Nà','Miền Trung',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,4.5,2,15.8801,108.338,1),(7,'Huế - Động Phong Nha 3N2Đ','hue-dong-phong-nha-3n2d','Di sản văn hóa thế giới','Tham quan Đại Nội Huế, lăng tẩm các vua triều Nguyễn, thưởng ngoạn sông Hương thơ mộng, khám phá động Phong Nha - hang động đẹp nhất thế giới.','',3290000.00,NULL,2303000.00,NULL,3,4,25,3,'DOMESTIC','Đà Nẵng','Huế - Phong Nha','Thừa Thiên Huế,Quảng Bình','Miền Trung',NULL,NULL,NULL,NULL,NULL,'','',0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,0,0,16.4637,107.5909,1),(8,'Quy Nhơn - Phú Yên 3N2Đ','quy-nhon-phu-yen-3n2d','Thiên đường biển ẩn mình','Khám phá thiên đường biển hoang sơ Quy Nhơn - Phú Yên: Gành Đá Đĩa kỳ thú, Eo Gió thơ mộng, bãi Xép tuyệt đẹp, Kỳ Co thiên đường.',NULL,2690000.00,2390000.00,1673000.00,NULL,3,4,25,1,'DOMESTIC','TP.HCM','Quy Nhơn - Phú Yên','Bình Định,Phú Yên','Miền Trung',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,13.783,109.2196,1),(9,'Nha Trang - Tour 4 Đảo 3N2Đ','nha-trang-tour-4-dao-3n2d','Thiên đường biển Nha Trang','Du thuyền khám phá 4 đảo Nha Trang: lặn ngắm san hô, tắm bùn khoáng, thưởng thức hải sản tươi sống, check-in Vinpearl Land.',NULL,3190000.00,NULL,2233000.00,NULL,3,4,30,1,'DOMESTIC','TP.HCM','Nha Trang','Khánh Hòa,Nha Trang','Miền Trung',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,4,2,12.2388,109.1967,1),(10,'Phú Quốc - Thiên đường nghỉ dưỡng 4N3Đ','phu-quoc-thien-duong-nghi-duong-4n3d','Đảo ngọc Phú Quốc','Tour cao cấp nghỉ dưỡng resort 5 sao, tham quan Vinpearl Safari, Grand World, câu cá, lặn ngắm san hô, thưởng thức hải sản tươi sống.',NULL,5990000.00,5390000.00,3773000.00,NULL,4,4,25,1,'DOMESTIC','TP.HCM','Phú Quốc','Kiên Giang,Phú Quốc','Miền Nam',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,5,2,10.2897,103.9837,1),(11,'Côn Đảo - Hành trình về cội nguồn 3N2Đ','con-dao-hanh-trinh-ve-coi-nguon-3n2d','Đảo thiêng liêng','Tham quan nhà tù Côn Đảo, nghĩa trang Hàng Dương, lặn ngắm san hô, thưởng thức hải sản, check-in biển xanh cát trắng.',NULL,6490000.00,NULL,4543000.00,NULL,3,4,20,1,'DOMESTIC','TP.HCM','Côn Đảo','Bà Rịa - Vũng Tàu,Côn Đảo','Miền Nam',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,8.6833,106.6,1),(12,'Cần Thơ - Miền Tây sông nước 3N2Đ','can-tho-mien-tay-song-nuoc-3n2d','Miền Tây sông nước','Khám phá chợ nổi Cái Răng, vườn trái cây Mỹ Khánh, nhà cổ Bình Thủy, ẩm thực đặc sản miền Tây, trải nghiệm đi thuyền trên sông.',NULL,2290000.00,NULL,1603000.00,NULL,3,4,25,3,'DOMESTIC','TP.HCM','Cần Thơ','Cần Thơ,Vĩnh Long,An Giang','Miền Tây',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1552850638-02d977a2a788?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,0,0,10.0452,105.7469,1),(13,'Vịnh Lan Hạ - Cát Bà 2N1Đ','vinh-lan-ha-cat-ba-2n1d','Vịnh Lan Hạ tuyệt đẹp','Du thuyền sang trọng khám phá Vịnh Lan Hạ hoang sơ, chèo kayak, bơi lội, tắm nắng, thưởng thức hải sản tươi sống trên thuyền.',NULL,2490000.00,2290000.00,1603000.00,NULL,2,4,25,1,'DOMESTIC','Hà Nội','Cát Bà - Lan Hạ','Hải Phòng,Cát Bà','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1528127269322-539801943592?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,20.7272,106.9802,1),(14,'Ninh Bình - Tràng An - Tam Cốc 1N2Đ','ninh-binh-trang-an-tam-coc-1n2d','Vịnh Hạ Long trên cạn','Tour 1 ngày khám phá Tràng An, Tam Cốc, Hang Múa, Bái Đính, Vân Long, thưởng thức đặc sản dê núi, cơm cháy.',NULL,1490000.00,NULL,1043000.00,NULL,1,4,30,6,'DOMESTIC','Hà Nội','Ninh Bình','Ninh Bình,Tràng An','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1587979206897-e954cb4c0e98?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,0,0,20.2506,105.9745,1),(15,'Mai Châu - Pù Luông 2N1Đ','mai-chau-pu-luong-2n1d','Homestay bản làng','Trải nghiệm homestay bản làng, ngắm ruộng bậc thang, đạp xe qua cánh đồng, thưởng thức rượu cần, múa sạp dân tộc Thái.',NULL,1990000.00,NULL,1393000.00,NULL,2,4,20,5,'DOMESTIC','Hà Nội','Mai Châu - Pù Luông','Hòa Bình,Thanh Hóa','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,20.6783,105.0642,1),(16,'Hà Giang - Cao nguyên đá 4N3Đ','ha-giang-cao-nguyen-da-4n3d','Cao nguyên đá Đồng Văn','Phượt Hà Giang chinh phục đèo Mã Pí Lèng, cao nguyên đá Đồng Văn, phố cổ Đồng Văn, cột cờ Lũng Cú, ruộng bậc thang.',NULL,4290000.00,3990000.00,2793000.00,NULL,4,6,15,8,'DOMESTIC','Hà Nội','Hà Giang','Hà Giang,Đồng Văn,Mèo Vạc','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,22.8236,104.9784,1),(17,'Mũi Né - Phan Thiết 3N2Đ','mui-ne-phan-thiet-3n2d','Biển xanh cát trắng','Nghỉ dưỡng resort, tham quan đồi cát bay, suối tiên, làng chài, ngắm bình minh, thưởng thức hải sản tươi sống.',NULL,2590000.00,NULL,1813000.00,NULL,3,4,30,1,'DOMESTIC','TP.HCM','Mũi Né - Phan Thiết','Bình Thuận,Mũi Né','Miền Trung',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:42:07',NULL,NULL,0,0,10.9333,108.1,1),(18,'Vũng Tàu - Hồ Cốc 2N1Đ','vung-tau-ho-coc-2n1d','Biển gần Sài Gòn','Tour cuối tuần tham quan Bạch Dinh, Tượng Chúa, Hải Đăng, tắm biển Hồ Cốc hoang sơ, check-in sống ảo.',NULL,1790000.00,NULL,1253000.00,NULL,2,4,30,1,'DOMESTIC','TP.HCM','Vũng Tàu','Bà Rịa - Vũng Tàu','Miền Nam',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,0,0,10.3459,107.0843,1),(19,'Quảng Bình - Thiên đường hang động 4N3Đ','quang-binh-thien-duong-hang-dong-4n3d','Vương quốc hang động','Khám phá động Thiên Đường, Sơn Đoòng (bên ngoài), Phong Nha, Paradise Cave, Dark Cave với zipline và kayak.',NULL,3790000.00,3330000.00,2331000.00,NULL,4,4,25,6,'DOMESTIC','Hà Nội','Quảng Bình','Quảng Bình,Động Phong Nha','Miền Trung',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(20,'Hạ Long - Yên Tử 3N2Đ','ha-long-yen-tu-3n2d','Thiên nhiên và tâm linh','Du thuyền Hạ Long 2N1Đ, leo chùa Yên Tử, cáp treo lên đỉnh Yên Tử, tham quan chùa Đồng, ngắm hoàng hôn trên vịnh.',NULL,3490000.00,NULL,2443000.00,NULL,3,4,25,6,'DOMESTIC','Hà Nội','Hạ Long - Yên Tử','Quảng Ninh,Yên Tử','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1528127269322-539801943592?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-19 07:38:55',NULL,NULL,0,0,20.9599,107.0431,1),(21,'Bình Ba - Đảo Tôm Hùm 2N1Đ','binh-ba-dao-tom-hum-2n1d','Đảo Tôm Hùm','Khám phá đảo Bình Ba hoang sơ, lặn ngắm san hô, tắm biển, thưởng thức tôm hùm giá rẻ, check-in sống ảo.',NULL,2190000.00,NULL,1533000.00,NULL,2,4,20,1,'DOMESTIC','Nha Trang','Bình Ba','Khánh Hòa,Bình Ba','Miền Trung',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(22,'Côn Sơn - Kiếp Bạc 1N2Đ','con-son-kiep-bac-1n2d','Hành hương tâm linh','Tour 1 ngày tham quan chùa Côn Sơn, đền Kiếp Bạc, đền Bà Chúa Kho, ngắm cảnh non nước hữu tình.',NULL,890000.00,NULL,623000.00,NULL,1,4,30,3,'DOMESTIC','Hà Nội','Hải Dương','Hải Dương,Hưng Yên','Miền Bắc',NULL,'VN',NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800','ACTIVE',0,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(23,'Bangkok - Pattaya 4N3Đ','bangkok-pattaya-4n3d','Thiên đường mua sắm','Tour Thái Lan tham quan chùa Vàng, Cung điện Hoàng gia, Safari World, show Alcazar, biển Pattaya, chợ đêm.','',6990000.00,5940000.00,4158000.00,NULL,4,10,30,6,'INTERNATIONAL','TP.HCM','Bangkok - Pattaya','Bangkok,Pattaya','Châu Á',NULL,NULL,NULL,NULL,NULL,'','',1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1563492065831-14b9bc1885fd?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(24,'Singapore - Garden City 4N3Đ','singapore-garden-city-4n3d','Đảo quốc sư tử','Tour Singapore tham quan Gardens by the Bay, Marina Bay Sands, Sentosa, Universal Studios, Merlion Park.',NULL,8990000.00,8090000.00,5663000.00,NULL,4,8,25,4,'INTERNATIONAL','TP.HCM','Singapore','Singapore','Đông Nam Á',NULL,'SG',NULL,NULL,NULL,NULL,NULL,0,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(25,'Seoul - Nami - Everland 5N4Đ','seoul-nami-everland-5n4d','Xứ sở kim chi','Tour Hàn Quốc tham quan cung điện Gyeongbokgung, làng Hanok, tháp N Seoul, đảo Nami, Everland, mua sắm Myeongdong.',NULL,12990000.00,11430000.00,8001000.00,NULL,5,10,25,4,'INTERNATIONAL','Hà Nội','Seoul','Seoul,Nami,Everland','Đông Bắc Á',NULL,'KR',NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(26,'Tokyo - Phú Sĩ - Osaka 6N5Đ','tokyo-phu-si-osaka-6n5d','Xứ sở hoa anh đào','Tour Nhật Bản tham quan Tokyo Tower, núi Phú Sĩ, Disneyland, đền Sensoji, Osaka Castle, mua sắm Shinjuku.','',21990000.00,14999000.00,15393000.00,NULL,6,10,20,4,'INTERNATIONAL','Hà Nội','Tokyo - Osaka','Tokyo,Phú Sĩ,Osaka','Đông Bắc Á',NULL,NULL,NULL,NULL,NULL,'','',1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(27,'Bali - Thiên đường nhiệt đới 5N4Đ','bali-thien-duong-nhiet-doi-5n4d','Đảo của các vị thần','Tour Bali tham quan đền Tanah Lot, ruộng bậc thang Tegalalang, núi lửa Batur, bãi biển Seminyak, nghỉ dưỡng resort.',NULL,9990000.00,9090000.00,6363000.00,NULL,5,8,25,4,'INTERNATIONAL','TP.HCM','Bali','Bali,Ubud,Seminyak','Đông Nam Á',NULL,'ID',NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(28,'Dubai - Abu Dhabi 5N4Đ','dubai-abu-dhabi-5n4d','Siêu thành phố sa mạc','Tour Dubai tham quan Burj Khalifa, đảo cọ, Dubai Mall, sa mạc Safari, Abu Dhabi Grand Mosque, mua sắm miễn thuế.',NULL,15990000.00,14710000.00,10297000.00,NULL,5,10,20,4,'INTERNATIONAL','TP.HCM','Dubai','Dubai,Abu Dhabi','Trung Đông',NULL,'AE',NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(29,'Maldives - Thiên đường biển 6N5Đ','maldives-thien-duong-bien-6n5d','Thiên đường trên mặt nước','Tour Maldives nghỉ dưỡng resort 5 sao, biệt thự trên mặt nước, lặn ngắm san hô, câu cá, spa, honeymoon lý tưởng.',NULL,29990000.00,NULL,20993000.00,NULL,6,2,20,7,'INTERNATIONAL','TP.HCM','Maldives','Malé,Maldives','Nam Á',NULL,'MV',NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1),(30,'Pháp - Thụy Sĩ - Ý 10N9Đ','phap-thuy-si-y-10n9d','Châu Âu cổ kính','Tour Châu Âu tham quan Paris, tháp Eiffel, Zurich, Milan, Venice, Roma, Vatican, ẩm thực Âu tinh tế.','',49990000.00,38999000.00,31493000.00,NULL,10,15,25,4,'INTERNATIONAL','Hà Nội','Paris - Zurich - Milan','Paris,Zurich,Milan,Roma','Châu Âu',NULL,NULL,NULL,NULL,NULL,'','',1,NULL,1,NULL,NULL,NULL,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','ACTIVE',1,0,'2025-10-02 03:40:59','2025-10-15 16:15:11',NULL,NULL,0,0,NULL,NULL,1);
/*!40000 ALTER TABLE `tours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `activity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_data` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referer_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_seconds` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_activities_user_id` (`user_id`),
  KEY `idx_user_activities_activity_type` (`activity_type`),
  KEY `idx_user_activities_created_at` (`created_at`),
  KEY `idx_user_activities_session_id` (`session_id`),
  KEY `idx_user_activities_ip_address` (`ip_address`),
  KEY `idx_user_activities_type` (`activity_type`),
  KEY `idx_user_activities_session` (`session_id`),
  CONSTRAINT `user_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `device_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logged_out_at` timestamp NULL DEFAULT NULL,
  `logout_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `browser_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `login_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_me` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_user_sessions_user_id` (`user_id`),
  KEY `idx_user_sessions_session_id` (`session_id`),
  KEY `idx_user_sessions_is_active` (`is_active`),
  KEY `idx_user_sessions_login_at` (`login_at`),
  KEY `idx_user_sessions_ip_address` (`ip_address`),
  KEY `idx_user_sessions_device_type` (`device_type`),
  KEY `idx_user_sessions_country` (`country`),
  KEY `idx_user_sessions_active` (`is_active`),
  KEY `idx_user_sessions_last_activity` (`last_activity`),
  KEY `idx_user_sessions_expires_at` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint DEFAULT NULL,
  `status` enum('PENDING','ACTIVE','INACTIVE','BANNED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `login_count` int DEFAULT '0',
  `total_bookings` int DEFAULT '0',
  `total_tour_views` int DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_dob` (`dob`),
  KEY `idx_users_created_at` (`created_at`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1207 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@travelbooking.vn','$2a$10$GUjFW7ARHZpXtfrB6g7KfuVJv/4ZyJ9TG3fvtcHhWKkZVwLOwUZkG',1,'ACTIVE','http://localhost:8080/uploads/1f0ea296-670e-4bd6-8c75-1a2570632979.jpeg','0868541104','Bắc Ninh','2004-11-14',NULL,'2025-09-30 14:19:08',0,0,0,NULL,NULL,'2025-09-30 14:19:08','2025-10-18 23:33:26',NULL),(2,'Nhân Viên Support 123','staff@travelbooking.vn','$2a$10$CiTae3kMKwFw1Y7a7/3AIezJ6C2wLCafV1qmBurdx6cPKt6zO4uqu',2,'ACTIVE',NULL,'0901234568','TP. Hồ Chí Minh',NULL,NULL,'2025-09-30 14:19:08',0,0,0,NULL,NULL,'2025-09-30 14:19:08','2025-10-16 15:33:58',NULL),(999,'Nguyễn Văn A','customer@test.com','$2a$10$t.vjaUznn4LA4jpPsApNn.vVPwq4drMyGX3E1ZJtdZ0nsJ1HQ4grG',3,'ACTIVE',NULL,'0123456789','Hà Nội',NULL,NULL,'2025-09-30 14:19:08',0,0,0,NULL,NULL,'2025-09-30 14:19:08','2025-10-16 15:33:58',NULL),(1196,'khoi123456789','khoi@gmail.com','$2a$10$J8pUUT.anQ63nB.UvnqswO8WjzY5V/SMZrfFequ1YLXZnwAaj/fn2',3,'ACTIVE',NULL,'0123456789',NULL,'2004-11-14',NULL,'2025-10-10 23:52:28',0,0,0,NULL,NULL,'2025-10-10 23:52:28','2025-10-16 15:33:58',NULL),(1197,'test123','test@gmail.com','$2a$10$B66QmWROHzjyPcO47M5aa.xZfcGsuxcjfmizN9ifagCcePWJZ.KDi',3,'ACTIVE',NULL,'0123456789',NULL,NULL,NULL,'2025-10-15 01:22:48',0,0,0,NULL,NULL,'2025-10-15 01:22:48','2025-10-16 15:33:58',NULL),(1202,'Dao','dao0312@gmail.com','$2a$10$TVsGWHWqNyhs2aa6X9PJYObwqsyXREj5ZwCovhwdWhjADkKQy4KJO',3,'ACTIVE',NULL,'0868541104','ABC',NULL,NULL,'2025-10-16 08:57:30',0,0,0,NULL,NULL,'2025-10-16 08:57:09','2025-10-16 09:20:11',NULL),(1203,'test 123','test123@gmail.com','$2a$10$..6liqRk8CrLZC1Ul7oZZeat6adQ1P1ta/aW/Maha4OWyAzuKSM4C',3,'ACTIVE',NULL,'0868541104',NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,'2025-10-16 09:00:32','2025-10-16 09:28:46',NULL),(1204,'nmk','khoi1411119@gmail.com','$2a$10$9tgNQSL0vkSbH9XUlP.AZuii0QEsAWiBpF0YtkxZqjb9G8OEHu2Oq',3,'ACTIVE','http://localhost:8080/uploads/4f7e2456-afaa-4687-b4c7-a1f7ad60ba8d.jpg','0123456789',NULL,'2000-01-14','MALE','2025-10-17 06:50:19',0,0,0,NULL,NULL,'2025-10-17 06:49:58','2025-10-17 07:19:35',NULL),(1205,'Point','khoi1411998@gmail.com','$2a$10$iMm8AJ9pVZ16Yg1NBaUrFOwLQArauVRJOj3t0n/pYrn1DtjhZk0li',3,'ACTIVE',NULL,'0132465978',NULL,'2001-10-10','MALE','2025-10-18 03:41:24',0,0,0,NULL,NULL,'2025-10-18 03:41:04','2025-10-18 03:41:24',NULL),(1206,'KMNKMN','khoi1411999@gmail.com','$2a$10$T2vSt4J.1LPeq0zxbXmw5evEaYuXYo1DURAOQ/8FRofVQI8tudbWe',3,'ACTIVE',NULL,'0123456789',NULL,'2000-01-01','MALE','2025-10-18 04:59:38',0,0,0,NULL,NULL,'2025-10-18 04:59:09','2025-10-18 04:59:38',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `tour_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`tour_id`),
  UNIQUE KEY `uk_wishlist_user_tour` (`user_id`,`tour_id`),
  KEY `idx_wishlists_user_id` (`user_id`),
  KEY `idx_wishlists_tour_id` (`tour_id`),
  KEY `idx_wishlists_user` (`user_id`),
  KEY `idx_wishlists_tour` (`tour_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (6,1,1,'2025-10-12 05:57:32'),(7,1,2,'2025-10-12 05:57:34'),(8,1196,1,'2025-10-13 01:39:06');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `tour_ratings`
--

/*!50001 DROP VIEW IF EXISTS `tour_ratings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `tour_ratings` AS select `reviews`.`tour_id` AS `tour_id`,count(0) AS `review_count`,avg(`reviews`.`rating`) AS `average_rating`,sum((case when (`reviews`.`rating` = 5) then 1 else 0 end)) AS `five_star_count`,sum((case when (`reviews`.`rating` = 4) then 1 else 0 end)) AS `four_star_count`,sum((case when (`reviews`.`rating` = 3) then 1 else 0 end)) AS `three_star_count`,sum((case when (`reviews`.`rating` = 2) then 1 else 0 end)) AS `two_star_count`,sum((case when (`reviews`.`rating` = 1) then 1 else 0 end)) AS `one_star_count` from `reviews` where (`reviews`.`status` = 'Approved') group by `reviews`.`tour_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tour_statistics`
--

/*!50001 DROP VIEW IF EXISTS `tour_statistics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `tour_statistics` AS select `t`.`id` AS `id`,`t`.`name` AS `name`,`t`.`tour_type` AS `tour_type`,`t`.`region` AS `region`,`t`.`status` AS `status`,count(distinct `b`.`id`) AS `total_bookings`,sum((case when (`b`.`payment_status` = 'Paid') then 1 else 0 end)) AS `paid_bookings`,sum((case when (`b`.`confirmation_status` = 'Cancelled') then 1 else 0 end)) AS `cancelled_bookings`,coalesce(`tr`.`average_rating`,0) AS `average_rating`,coalesce(`tr`.`review_count`,0) AS `review_count`,`t`.`view_count` AS `view_count` from ((`tours` `t` left join `bookings` `b` on((`t`.`id` = `b`.`tour_id`))) left join `tour_ratings` `tr` on((`t`.`id` = `tr`.`tour_id`))) group by `t`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 16:10:00
