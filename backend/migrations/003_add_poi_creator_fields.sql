-- Add creator tracking for POIs to enforce moderator edit scope.

ALTER TABLE pois
    ADD COLUMN IF NOT EXISTS created_by INT NULL AFTER owner_id;

-- Backfill old rows so existing ownership data stays editable by current owner.
UPDATE pois
SET created_by = owner_id
WHERE created_by IS NULL;

ALTER TABLE pois
    ADD INDEX IF NOT EXISTS idx_pois_created_by (created_by);

-- Keep referential integrity with users table.
SET @db_name = DATABASE();
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_schema = @db_name
      AND table_name = 'pois'
      AND constraint_name = 'fk_pois_created_by'
      AND constraint_type = 'FOREIGN KEY'
);

SET @sql = IF(
    @fk_exists = 0,
    'ALTER TABLE pois ADD CONSTRAINT fk_pois_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT ''fk_pois_created_by exists'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;