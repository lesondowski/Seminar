-- New schema aligned with backend SQLAlchemy models.
-- Target: MySQL 8+

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    role ENUM('visitor', 'owner', 'moderator', 'admin') NOT NULL DEFAULT 'visitor',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pois (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price VARCHAR(20) NOT NULL DEFAULT '$$',
    image VARCHAR(512) NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT '',
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    rating DOUBLE NOT NULL DEFAULT 0,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    website VARCHAR(255) NOT NULL DEFAULT '',
    audio VARCHAR(512) NOT NULL DEFAULT '',
    narration_source_language VARCHAR(10) NOT NULL DEFAULT 'vi',
    narration_content TEXT NOT NULL,
    hours VARCHAR(100) NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reject_reason TEXT NOT NULL,
    owner_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pois_name (name),
    KEY idx_pois_owner_id (owner_id),
    KEY idx_pois_status (status),
    KEY idx_pois_category (category),
    KEY idx_pois_lat_lng (lat, lng),
    KEY idx_pois_owner_status (owner_id, status),
    CONSTRAINT fk_pois_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT NOT NULL AUTO_INCREMENT,
    poi_id INT NOT NULL,
    name_vi VARCHAR(255) NOT NULL DEFAULT '',
    name_en VARCHAR(255) NOT NULL DEFAULT '',
    name_zh VARCHAR(255) NOT NULL DEFAULT '',
    description_vi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_zh TEXT NOT NULL,
    price INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    image VARCHAR(512) NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_menu_items_poi_id (poi_id),
    KEY idx_menu_items_category (category),
    KEY idx_menu_items_poi_category (poi_id, category),
    CONSTRAINT fk_menu_items_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tours (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'VI',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    duration VARCHAR(50) NOT NULL DEFAULT '',
    poi_ids JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_tours_status_language (status, language),
    KEY idx_tours_created_at (created_at),
    CONSTRAINT chk_tours_poi_ids_json CHECK (json_valid(poi_ids))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
