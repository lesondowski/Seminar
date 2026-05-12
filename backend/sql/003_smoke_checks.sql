USE gps_visitor_app;

SELECT 'tables_count' AS check_name, COUNT(*) AS value
FROM information_schema.tables
WHERE table_schema = DATABASE();

SELECT 'site_exists' AS check_name, COUNT(*) AS value
FROM sites
WHERE site_code = 'HANOI-OLD-QUARTER';

SELECT 'active_qr_count' AS check_name, COUNT(*) AS value
FROM qr_access_codes
WHERE is_active = 1;

SELECT 'poi_count' AS check_name, COUNT(*) AS value
FROM pois;

SELECT 'published_snapshot_pointer' AS check_name,
       s.current_publish_snapshot_id AS value
FROM sites s
WHERE s.site_code = 'HANOI-OLD-QUARTER';

SELECT 'active_visitor_sessions' AS check_name, COUNT(*) AS value
FROM sessions
WHERE session_scope = 'visitor' AND session_state = 'active';

SELECT 'online_devices_5m' AS check_name, COUNT(*) AS value
FROM sessions
WHERE session_scope = 'visitor'
  AND session_state = 'active'
  AND last_activity_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE);
