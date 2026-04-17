# Legacy DB to New MySQL Schema Migration

This guide migrates from the old schema in `Database_Vinhkhanh.sql` to the backend schema used by SQLAlchemy models.

## Files
- `migrations/000_archive_legacy_schema.sql`: renames old tables to `legacy_*`.
- `migrations/001_create_new_schema.sql`: creates new tables (`users`, `pois`, `menu_items`, `tours`) with constraints and indexes.
- `migrations/002_add_extended_domain_tables.sql`: adds additional business tables (`restaurants`, `poi_categories`, `poi_translations`, `poi_images`, `poi_ratings`, `tour_pois`) while keeping backend core schema.
- `scripts/migrate_legacy_to_new.py`: moves data from `legacy_*` to new tables.

## Preconditions
- Use MySQL 8+.
- Backend `.env` must point to the target MySQL database.
- Create a full DB backup before migration.

## Run order
### Path A: Legacy migration (when old data exists)
1. Archive old schema:

```sql
SOURCE backend/migrations/000_archive_legacy_schema.sql;
```

2. Create new schema:

```sql
SOURCE backend/migrations/001_create_new_schema.sql;
```

3. Run data migration script:

```bash
cd backend
py scripts/migrate_legacy_to_new.py
```

4. Add extended business tables:

```sql
SOURCE backend/migrations/002_add_extended_domain_tables.sql;
```

### Path B: Fresh start (no legacy import)
1. Create new core schema:

```sql
SOURCE backend/migrations/001_create_new_schema.sql;
```

2. Add extended business tables:

```sql
SOURCE backend/migrations/002_add_extended_domain_tables.sql;
```

## Data mapping summary
- `legacy_users.role='restaurant'` -> `users.role='owner'`.
- `legacy_users.preferred_language` -> `users.language` (fallback `vi`).
- `legacy_pois` + `legacy_restaurants` + translation/image/rating tables -> `pois`.
- `legacy_tours` + `legacy_tour_pois` -> `tours.poi_ids` (JSON array sorted by `order_index`).
- `menu_items` starts empty because legacy schema has no menu table.

## Post-migration checks
Run these checks after migration:

```sql
SELECT COUNT(*) AS users_count FROM users;
SELECT COUNT(*) AS pois_count FROM pois;
SELECT COUNT(*) AS tours_count FROM tours;
SELECT COUNT(*) AS menu_items_count FROM menu_items;

SELECT role, COUNT(*) FROM users GROUP BY role;
SELECT status, COUNT(*) FROM pois GROUP BY status;
```
