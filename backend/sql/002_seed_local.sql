USE gps_visitor_app;

INSERT INTO sites (site_code, name, is_active)
VALUES ('HANOI-OLD-QUARTER', 'Ha Noi Old Quarter', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = VALUES(is_active);

INSERT INTO users (username, password_hash, role, is_active)
VALUES ('admin', '$2b$12$demo.hash.replace.in.real.deploy', 'admin', 1)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

INSERT INTO site_app_configs (
  site_id,
  default_language,
  trigger_radius_m,
  exit_radius_m,
  debounce_seconds,
  replay_distance_m,
  chatbot_timeout_ms,
  chatbot_retry_count,
  gps_poll_interval_seconds
)
SELECT s.id, 'vi', 5, 7, 2, 100, 3000, 1, 2
FROM sites s
WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE
  default_language = VALUES(default_language),
  trigger_radius_m = VALUES(trigger_radius_m),
  exit_radius_m = VALUES(exit_radius_m),
  debounce_seconds = VALUES(debounce_seconds),
  replay_distance_m = VALUES(replay_distance_m),
  chatbot_timeout_ms = VALUES(chatbot_timeout_ms),
  chatbot_retry_count = VALUES(chatbot_retry_count),
  gps_poll_interval_seconds = VALUES(gps_poll_interval_seconds);

INSERT INTO site_supported_languages (site_id, language_code, sort_order)
SELECT s.id, t.language_code, t.sort_order
FROM sites s
JOIN (
  SELECT 'vi' AS language_code, 1 AS sort_order
  UNION ALL SELECT 'en', 2
  UNION ALL SELECT 'fr', 3
  UNION ALL SELECT 'ja', 4
) t
WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

INSERT INTO qr_access_codes (site_id, qr_code, access_mode, is_active)
SELECT s.id, 'SITE-ENTRY-FREE-001', 'free', 1 FROM sites s WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active), access_mode = VALUES(access_mode);

INSERT INTO qr_access_codes (site_id, qr_code, access_mode, is_active)
SELECT s.id, 'SITE-ENTRY-PAID-001', 'paid', 1 FROM sites s WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active), access_mode = VALUES(access_mode);

INSERT INTO pois (site_id, lat, lng, trigger_radius, image_url, is_active)
SELECT s.id, 21.0342670, 105.8379000, 5, 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', 1
FROM sites s WHERE s.site_code = 'HANOI-OLD-QUARTER'
AND NOT EXISTS (SELECT 1 FROM pois p WHERE p.site_id = s.id LIMIT 1);

INSERT INTO pois (site_id, lat, lng, trigger_radius, image_url, is_active)
SELECT s.id, 21.0285110, 105.8048170, 5, 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1200&q=80', 1
FROM sites s WHERE s.site_code = 'HANOI-OLD-QUARTER'
AND (SELECT COUNT(*) FROM pois p WHERE p.site_id = s.id) < 2;

INSERT INTO poi_translations (poi_id, language_code, name, description, audio_url)
SELECT p.id, 'vi', 'Khuê Văn Các', 'Biểu tượng nổi bật của Văn Miếu - Quốc Tử Giám tại Hà Nội.', NULL
FROM pois p
JOIN sites s ON s.id = p.site_id
WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), audio_url = VALUES(audio_url);

INSERT INTO poi_translations (poi_id, language_code, name, description, audio_url)
SELECT p.id, 'en', 'Khue Van Cac', 'A landmark pavilion in the Temple of Literature, Ha Noi.', NULL
FROM pois p
JOIN sites s ON s.id = p.site_id
WHERE s.site_code = 'HANOI-OLD-QUARTER'
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), audio_url = VALUES(audio_url);

INSERT INTO tours (site_id, name, description, is_active)
SELECT s.id, 'Tour co ban', 'Hanh trinh noi bat khu trung tam.', 1
FROM sites s
WHERE s.site_code = 'HANOI-OLD-QUARTER'
AND NOT EXISTS (SELECT 1 FROM tours t WHERE t.site_id = s.id AND t.name = 'Tour co ban')
LIMIT 1;

INSERT INTO tour_pois (tour_id, poi_id, sequence_no)
SELECT t.id, p.id, ROW_NUMBER() OVER (ORDER BY p.id)
FROM tours t
JOIN sites s ON s.id = t.site_id
JOIN pois p ON p.site_id = s.id
WHERE s.site_code = 'HANOI-OLD-QUARTER'
  AND t.name = 'Tour co ban'
ON DUPLICATE KEY UPDATE sequence_no = VALUES(sequence_no);

INSERT INTO publish_snapshots (site_id, bootstrap_version, published_by_user_id)
SELECT s.id,
       CONCAT('site-', s.id, '-published-', DATE_FORMAT(UTC_TIMESTAMP(), '%Y%m%dT%H%i%sZ')),
       u.id
FROM sites s
JOIN users u ON u.username = 'admin'
WHERE s.site_code = 'HANOI-OLD-QUARTER'
ORDER BY s.id DESC
LIMIT 1;

SET @snapshot_id = (SELECT id FROM publish_snapshots ORDER BY id DESC LIMIT 1);
SET @site_id = (SELECT id FROM sites WHERE site_code = 'HANOI-OLD-QUARTER' LIMIT 1);

INSERT INTO publish_snapshot_languages (publish_snapshot_id, language_code, sort_order)
SELECT @snapshot_id, language_code, sort_order
FROM site_supported_languages
WHERE site_id = @site_id
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

INSERT INTO published_pois (publish_snapshot_id, source_poi_id, lat, lng, trigger_radius, image_url)
SELECT @snapshot_id, p.id, p.lat, p.lng, p.trigger_radius, p.image_url
FROM pois p
WHERE p.site_id = @site_id;

INSERT INTO published_poi_translations (published_poi_id, language_code, name, description, audio_url)
SELECT pp.id, pt.language_code, pt.name, pt.description, pt.audio_url
FROM published_pois pp
JOIN poi_translations pt ON pt.poi_id = pp.source_poi_id
WHERE pp.publish_snapshot_id = @snapshot_id;

INSERT INTO published_tours (publish_snapshot_id, source_tour_id, name, description)
SELECT @snapshot_id, t.id, t.name, t.description
FROM tours t
WHERE t.site_id = @site_id;

INSERT INTO published_tour_pois (published_tour_id, published_poi_id, sequence_no)
SELECT pt.id, pp.id, tp.sequence_no
FROM published_tours pt
JOIN tour_pois tp ON tp.tour_id = pt.source_tour_id
JOIN published_pois pp
  ON pp.publish_snapshot_id = pt.publish_snapshot_id
 AND pp.source_poi_id = tp.poi_id
WHERE pt.publish_snapshot_id = @snapshot_id;

UPDATE sites
SET current_publish_snapshot_id = @snapshot_id
WHERE id = @site_id;

INSERT INTO sessions (
  session_uuid,
  session_scope,
  session_state,
  site_id,
  requires_payment,
  access_token_expires_at,
  refresh_token_expires_at,
  last_activity_at,
  bootstrap_version
)
SELECT
  UUID(),
  'visitor',
  'active',
  @site_id,
  0,
  DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE),
  DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
  UTC_TIMESTAMP(),
  (SELECT bootstrap_version FROM publish_snapshots WHERE id = @snapshot_id)
LIMIT 1;
