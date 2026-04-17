-- Archive legacy tables so new MySQL schema can reuse table names expected by backend.
-- Run this once before creating new schema tables.

SET @db_name = DATABASE();

-- users -> legacy_users only when table is legacy shape (has preferred_language)
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = @db_name AND table_name = 'users' AND column_name = 'preferred_language'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_users'
    ),
    'RENAME TABLE users TO legacy_users',
    'SELECT ''skip users rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pois -> legacy_pois only when table is legacy shape (has title)
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = @db_name AND table_name = 'pois' AND column_name = 'title'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_pois'
    ),
    'RENAME TABLE pois TO legacy_pois',
    'SELECT ''skip pois rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tours -> legacy_tours only when table is legacy shape (has estimated_duration_min)
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = @db_name AND table_name = 'tours' AND column_name = 'estimated_duration_min'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_tours'
    ),
    'RENAME TABLE tours TO legacy_tours',
    'SELECT ''skip tours rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tables that only exist in legacy schema
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'restaurants'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_restaurants'
    ),
    'RENAME TABLE restaurants TO legacy_restaurants',
    'SELECT ''skip restaurants rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'poi_categories'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_poi_categories'
    ),
    'RENAME TABLE poi_categories TO legacy_poi_categories',
    'SELECT ''skip poi_categories rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'poi_translations'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_poi_translations'
    ),
    'RENAME TABLE poi_translations TO legacy_poi_translations',
    'SELECT ''skip poi_translations rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'poi_images'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_poi_images'
    ),
    'RENAME TABLE poi_images TO legacy_poi_images',
    'SELECT ''skip poi_images rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'poi_ratings'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_poi_ratings'
    ),
    'RENAME TABLE poi_ratings TO legacy_poi_ratings',
    'SELECT ''skip poi_ratings rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'tour_pois'
    )
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = @db_name AND table_name = 'legacy_tour_pois'
    ),
    'RENAME TABLE tour_pois TO legacy_tour_pois',
    'SELECT ''skip tour_pois rename'''
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
