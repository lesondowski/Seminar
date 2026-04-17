-- Add extended domain tables from legacy design while keeping current core schema.
-- This migration is safe to run on top of 001_create_new_schema.sql.

CREATE TABLE IF NOT EXISTS restaurants (
    id INT NOT NULL AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_restaurants_owner (owner_id),
    KEY idx_restaurants_status (status),
    CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poi_categories (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_poi_categories_slug (slug),
    KEY idx_poi_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poi_translations (
    id INT NOT NULL AUTO_INCREMENT,
    poi_id INT NOT NULL,
    language_code ENUM('vi', 'en', 'es', 'zh', 'ko', 'ja') NOT NULL DEFAULT 'vi',
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    audio_script TEXT NOT NULL,
    is_auto_translated BOOLEAN NOT NULL DEFAULT TRUE,
    source_language ENUM('vi', 'en', 'es', 'zh', 'ko', 'ja') NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_poi_translations_poi_lang (poi_id, language_code),
    KEY idx_poi_translations_language (language_code),
    CONSTRAINT fk_poi_translations_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poi_images (
    id INT NOT NULL AUTO_INCREMENT,
    poi_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_poi_images_poi (poi_id),
    KEY idx_poi_images_order (poi_id, display_order),
    KEY idx_poi_images_primary (poi_id, is_primary),
    CONSTRAINT fk_poi_images_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poi_ratings (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    poi_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_poi_ratings_user_poi (user_id, poi_id),
    KEY idx_poi_ratings_poi (poi_id),
    CONSTRAINT chk_poi_ratings_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_poi_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_poi_ratings_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tour_pois (
    id INT NOT NULL AUTO_INCREMENT,
    tour_id INT NOT NULL,
    poi_id INT NOT NULL,
    order_index INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tour_pois_tour_order (tour_id, order_index),
    UNIQUE KEY uq_tour_pois_tour_poi (tour_id, poi_id),
    KEY idx_tour_pois_poi (poi_id),
    CONSTRAINT fk_tour_pois_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tour_pois_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
