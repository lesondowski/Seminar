SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS gps_visitor_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gps_visitor_app;

CREATE TABLE IF NOT EXISTS sites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  current_publish_snapshot_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_sites_site_code (site_code),
  KEY idx_sites_current_publish_snapshot_id (current_publish_snapshot_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_app_configs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  default_language CHAR(5) NOT NULL,
  trigger_radius_m INT UNSIGNED NOT NULL,
  exit_radius_m INT UNSIGNED NOT NULL,
  debounce_seconds INT UNSIGNED NOT NULL,
  replay_distance_m INT UNSIGNED NOT NULL,
  chatbot_timeout_ms INT UNSIGNED NOT NULL,
  chatbot_retry_count INT UNSIGNED NOT NULL,
  gps_poll_interval_seconds INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_site_app_configs_site_id (site_id),
  CONSTRAINT fk_site_app_configs_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT chk_site_app_configs_trigger CHECK (trigger_radius_m > 0),
  CONSTRAINT chk_site_app_configs_exit CHECK (exit_radius_m >= trigger_radius_m),
  CONSTRAINT chk_site_app_configs_debounce CHECK (debounce_seconds > 0),
  CONSTRAINT chk_site_app_configs_replay CHECK (replay_distance_m > exit_radius_m),
  CONSTRAINT chk_site_app_configs_timeout CHECK (chatbot_timeout_ms > 0),
  CONSTRAINT chk_site_app_configs_gps_poll CHECK (gps_poll_interval_seconds > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_supported_languages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  language_code CHAR(5) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_site_supported_languages_site_language (site_id, language_code),
  KEY idx_site_supported_languages_site_sort (site_id, sort_order),
  CONSTRAINT fk_site_supported_languages_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS qr_access_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  qr_code VARCHAR(255) NOT NULL,
  access_mode ENUM('free', 'paid') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_qr_access_codes_qr_code (qr_code),
  KEY idx_qr_access_codes_site_id (site_id),
  KEY idx_qr_access_codes_active_expires (is_active, expires_at),
  CONSTRAINT fk_qr_access_codes_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS qr_access_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  qr_access_code_id BIGINT UNSIGNED NOT NULL,
  site_id BIGINT UNSIGNED NOT NULL,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(512) NOT NULL,
  result ENUM('accepted', 'rejected', 'expired', 'not_found') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_qr_access_events_qr_access_code_id (qr_access_code_id),
  KEY idx_qr_access_events_site_id (site_id),
  KEY idx_qr_access_events_created_at (created_at),
  CONSTRAINT fk_qr_access_events_qr_access_code FOREIGN KEY (qr_access_code_id) REFERENCES qr_access_codes(id),
  CONSTRAINT fk_qr_access_events_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_uuid CHAR(36) NOT NULL,
  session_scope ENUM('visitor', 'admin') NOT NULL,
  session_state ENUM('created', 'active', 'expired', 'revoked') NOT NULL,
  site_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  qr_access_event_id BIGINT UNSIGNED NULL,
  qr_access_code_id BIGINT UNSIGNED NULL,
  requires_payment TINYINT(1) NOT NULL DEFAULT 0,
  bootstrap_version VARCHAR(128) NULL,
  refresh_token_hash VARCHAR(255) NULL,
  access_token_expires_at DATETIME NOT NULL,
  refresh_token_expires_at DATETIME NULL,
  last_activity_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_sessions_session_uuid (session_uuid),
  KEY idx_sessions_scope_state_activity (session_scope, session_state, last_activity_at),
  KEY idx_sessions_site_id (site_id),
  KEY idx_sessions_user_id (user_id),
  KEY idx_sessions_qr_access_event_id (qr_access_event_id),
  KEY idx_sessions_qr_access_code_id (qr_access_code_id),
  CONSTRAINT fk_sessions_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_sessions_qr_access_event FOREIGN KEY (qr_access_event_id) REFERENCES qr_access_events(id),
  CONSTRAINT fk_sessions_qr_access_code FOREIGN KEY (qr_access_code_id) REFERENCES qr_access_codes(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pois (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  trigger_radius INT UNSIGNED NOT NULL,
  image_url VARCHAR(2048) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pois_site_id (site_id),
  KEY idx_pois_site_active (site_id, is_active),
  CONSTRAINT fk_pois_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT chk_pois_trigger_radius CHECK (trigger_radius > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS poi_translations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  poi_id BIGINT UNSIGNED NOT NULL,
  language_code CHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  audio_url VARCHAR(2048) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_poi_translations_poi_lang (poi_id, language_code),
  KEY idx_poi_translations_language_code (language_code),
  CONSTRAINT fk_poi_translations_poi FOREIGN KEY (poi_id) REFERENCES pois(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tours (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tours_site_id (site_id),
  KEY idx_tours_site_active (site_id, is_active),
  CONSTRAINT fk_tours_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tour_pois (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tour_id BIGINT UNSIGNED NOT NULL,
  poi_id BIGINT UNSIGNED NOT NULL,
  sequence_no INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_tour_pois_tour_sequence (tour_id, sequence_no),
  UNIQUE KEY ux_tour_pois_tour_poi (tour_id, poi_id),
  KEY idx_tour_pois_poi_id (poi_id),
  CONSTRAINT fk_tour_pois_tour FOREIGN KEY (tour_id) REFERENCES tours(id),
  CONSTRAINT fk_tour_pois_poi FOREIGN KEY (poi_id) REFERENCES pois(id),
  CONSTRAINT chk_tour_pois_sequence CHECK (sequence_no > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publish_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id BIGINT UNSIGNED NOT NULL,
  bootstrap_version VARCHAR(128) NOT NULL,
  published_by_user_id BIGINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_publish_snapshots_bootstrap_version (bootstrap_version),
  KEY idx_publish_snapshots_site_id (site_id),
  KEY idx_publish_snapshots_published_at (published_at),
  CONSTRAINT fk_publish_snapshots_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT fk_publish_snapshots_user FOREIGN KEY (published_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publish_snapshot_languages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  publish_snapshot_id BIGINT UNSIGNED NOT NULL,
  language_code CHAR(5) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_publish_snapshot_languages_snapshot_lang (publish_snapshot_id, language_code),
  KEY idx_publish_snapshot_languages_snapshot_sort (publish_snapshot_id, sort_order),
  CONSTRAINT fk_publish_snapshot_languages_snapshot FOREIGN KEY (publish_snapshot_id) REFERENCES publish_snapshots(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS published_pois (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  publish_snapshot_id BIGINT UNSIGNED NOT NULL,
  source_poi_id BIGINT UNSIGNED NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  trigger_radius INT UNSIGNED NOT NULL,
  image_url VARCHAR(2048) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_published_pois_snapshot_source (publish_snapshot_id, source_poi_id),
  KEY idx_published_pois_snapshot_id (publish_snapshot_id),
  CONSTRAINT fk_published_pois_snapshot FOREIGN KEY (publish_snapshot_id) REFERENCES publish_snapshots(id),
  CONSTRAINT chk_published_pois_trigger CHECK (trigger_radius > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS published_poi_translations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  published_poi_id BIGINT UNSIGNED NOT NULL,
  language_code CHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  audio_url VARCHAR(2048) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_published_poi_translations_poi_lang (published_poi_id, language_code),
  KEY idx_published_poi_translations_language_code (language_code),
  CONSTRAINT fk_published_poi_translations_poi FOREIGN KEY (published_poi_id) REFERENCES published_pois(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS published_tours (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  publish_snapshot_id BIGINT UNSIGNED NOT NULL,
  source_tour_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_published_tours_snapshot_source (publish_snapshot_id, source_tour_id),
  KEY idx_published_tours_snapshot_id (publish_snapshot_id),
  CONSTRAINT fk_published_tours_snapshot FOREIGN KEY (publish_snapshot_id) REFERENCES publish_snapshots(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS published_tour_pois (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  published_tour_id BIGINT UNSIGNED NOT NULL,
  published_poi_id BIGINT UNSIGNED NOT NULL,
  sequence_no INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_published_tour_pois_tour_sequence (published_tour_id, sequence_no),
  UNIQUE KEY ux_published_tour_pois_tour_poi (published_tour_id, published_poi_id),
  KEY idx_published_tour_pois_poi_id (published_poi_id),
  CONSTRAINT fk_published_tour_pois_tour FOREIGN KEY (published_tour_id) REFERENCES published_tours(id),
  CONSTRAINT fk_published_tour_pois_poi FOREIGN KEY (published_poi_id) REFERENCES published_pois(id),
  CONSTRAINT chk_published_tour_pois_sequence CHECK (sequence_no > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chatbot_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  site_id BIGINT UNSIGNED NOT NULL,
  bootstrap_version VARCHAR(128) NOT NULL,
  language_code CHAR(5) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type ENUM('published_data') NOT NULL,
  status ENUM('success', 'fallback', 'error') NOT NULL,
  latency_ms INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chatbot_logs_session_id (session_id),
  KEY idx_chatbot_logs_site_id (site_id),
  KEY idx_chatbot_logs_created_at (created_at),
  CONSTRAINT fk_chatbot_logs_session FOREIGN KEY (session_id) REFERENCES sessions(id),
  CONSTRAINT fk_chatbot_logs_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  site_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'VND',
  status ENUM('pending', 'paid', 'failed') NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_payment_logs_idempotency_key (idempotency_key),
  KEY idx_payment_logs_session_id (session_id),
  KEY idx_payment_logs_site_id (site_id),
  CONSTRAINT fk_payment_logs_session FOREIGN KEY (session_id) REFERENCES sessions(id),
  CONSTRAINT fk_payment_logs_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NOT NULL,
  site_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_actor_user_id (actor_user_id),
  KEY idx_audit_logs_site_id (site_id),
  KEY idx_audit_logs_action_entity (action, entity_type),
  KEY idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_logs_actor_user FOREIGN KEY (actor_user_id) REFERENCES users(id),
  CONSTRAINT fk_audit_logs_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB;

ALTER TABLE sites
  ADD CONSTRAINT fk_sites_current_publish_snapshot
  FOREIGN KEY (current_publish_snapshot_id) REFERENCES publish_snapshots(id);
