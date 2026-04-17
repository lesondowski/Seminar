import sys
from pathlib import Path

from sqlalchemy import create_engine, text

# Ensure imports work when running script directly: `py scripts\migrate_legacy_to_new.py`
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)

REQUIRED_LEGACY_TABLES = [
    'legacy_users',
    'legacy_restaurants',
    'legacy_pois',
    'legacy_tours',
]


def table_exists(conn, table_name: str) -> bool:
    row = conn.execute(
        text(
            """
            SELECT COUNT(*) AS c
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = :table_name
            """
        ),
        {'table_name': table_name},
    ).scalar_one()
    return bool(row)


def assert_preconditions(conn) -> None:
    missing_legacy = [name for name in REQUIRED_LEGACY_TABLES if not table_exists(conn, name)]
    if missing_legacy:
        joined = ', '.join(missing_legacy)
        raise RuntimeError(
            f'Missing legacy tables: {joined}. '
            'Run migrations/000_archive_legacy_schema.sql first.'
        )

    missing_new = [name for name in ['users', 'pois', 'menu_items', 'tours'] if not table_exists(conn, name)]
    if missing_new:
        joined = ', '.join(missing_new)
        raise RuntimeError(
            f'Missing new tables: {joined}. '
            'Run migrations/001_create_new_schema.sql first.'
        )


def migrate_users(conn) -> None:
    conn.execute(
        text(
            """
            INSERT INTO users (id, email, language, role, created_at, updated_at)
            SELECT
                lu.id,
                lu.email,
                CASE
                    WHEN lu.preferred_language IN ('vi', 'en', 'zh') THEN lu.preferred_language
                    ELSE 'vi'
                END AS language,
                CASE
                    WHEN lu.role = 'restaurant' THEN 'owner'
                    WHEN lu.role IN ('visitor', 'admin') THEN lu.role
                    ELSE 'visitor'
                END AS role,
                COALESCE(lu.created_at, CURRENT_TIMESTAMP),
                COALESCE(lu.updated_at, CURRENT_TIMESTAMP)
            FROM legacy_users lu
            ON DUPLICATE KEY UPDATE
                language = VALUES(language),
                role = VALUES(role),
                updated_at = VALUES(updated_at)
            """
        )
    )


def migrate_pois(conn) -> None:
    conn.execute(
        text(
            """
            INSERT INTO pois (
                id,
                name,
                description,
                price,
                image,
                category,
                lat,
                lng,
                rating,
                phone,
                website,
                audio,
                narration_source_language,
                narration_content,
                hours,
                address,
                status,
                reject_reason,
                owner_id,
                created_at,
                updated_at
            )
            SELECT
                p.id,
                p.title,
                COALESCE(p.description, ''),
                CASE
                    WHEN p.price_min IS NOT NULL AND p.price_max IS NOT NULL
                        THEN CONCAT(CAST(p.price_min AS CHAR), '-', CAST(p.price_max AS CHAR))
                    WHEN p.price_min IS NOT NULL
                        THEN CAST(p.price_min AS CHAR)
                    WHEN p.price_max IS NOT NULL
                        THEN CAST(p.price_max AS CHAR)
                    ELSE '$$'
                END AS price,
                COALESCE(img.url, ''),
                COALESCE(pc.name, ''),
                p.latitude,
                p.longitude,
                COALESCE(rt.avg_rating, 0),
                COALESCE(r.phone, ''),
                '' AS website,
                COALESCE(tr.audio_script, ''),
                COALESCE(tr.language_code, 'vi') AS narration_source_language,
                COALESCE(tr.audio_script, '') AS narration_content,
                '' AS hours,
                '' AS address,
                CASE
                    WHEN r.status = 'approved' THEN 'approved'
                    WHEN r.status = 'rejected' THEN 'rejected'
                    ELSE 'pending'
                END AS status,
                CASE WHEN r.status = 'rejected' THEN 'Rejected in legacy system' ELSE '' END,
                r.owner_id,
                COALESCE(p.created_at, CURRENT_TIMESTAMP),
                COALESCE(p.updated_at, CURRENT_TIMESTAMP)
            FROM legacy_pois p
            INNER JOIN legacy_restaurants r ON r.id = p.restaurant_id
            LEFT JOIN legacy_poi_categories pc ON pc.id = p.category_id
            LEFT JOIN (
                SELECT poi_id, AVG(rating) AS avg_rating
                FROM legacy_poi_ratings
                GROUP BY poi_id
            ) rt ON rt.poi_id = p.id
            LEFT JOIN (
                SELECT ranked.poi_id, ranked.url
                FROM (
                    SELECT
                        pi.poi_id,
                        pi.url,
                        ROW_NUMBER() OVER (
                            PARTITION BY pi.poi_id
                            ORDER BY pi.is_primary DESC, pi.display_order ASC, pi.id ASC
                        ) AS rn
                    FROM legacy_poi_images pi
                ) ranked
                WHERE ranked.rn = 1
            ) img ON img.poi_id = p.id
            LEFT JOIN (
                SELECT
                    chosen.poi_id,
                    chosen.language_code,
                    chosen.audio_script
                FROM (
                    SELECT
                        pt.poi_id,
                        pt.language_code,
                        pt.audio_script,
                        ROW_NUMBER() OVER (
                            PARTITION BY pt.poi_id
                            ORDER BY
                                CASE WHEN pt.language_code = 'vi' THEN 0 ELSE 1 END,
                                pt.id ASC
                        ) AS rn
                    FROM legacy_poi_translations pt
                ) chosen
                WHERE chosen.rn = 1
            ) tr ON tr.poi_id = p.id
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                price = VALUES(price),
                image = VALUES(image),
                category = VALUES(category),
                lat = VALUES(lat),
                lng = VALUES(lng),
                rating = VALUES(rating),
                phone = VALUES(phone),
                audio = VALUES(audio),
                narration_source_language = VALUES(narration_source_language),
                narration_content = VALUES(narration_content),
                status = VALUES(status),
                reject_reason = VALUES(reject_reason),
                owner_id = VALUES(owner_id),
                updated_at = VALUES(updated_at)
            """
        )
    )


def migrate_tours(conn) -> None:
    conn.execute(
        text(
            """
            INSERT INTO tours (id, name, description, language, status, duration, poi_ids, created_at, updated_at)
            SELECT
                t.id,
                t.name,
                COALESCE(t.description, ''),
                'VI' AS language,
                'published' AS status,
                CASE
                    WHEN t.estimated_duration_min IS NULL THEN ''
                    ELSE CONCAT(CAST(t.estimated_duration_min AS CHAR), ' min')
                END AS duration,
                COALESCE(tp.poi_ids, JSON_ARRAY()) AS poi_ids,
                COALESCE(t.created_at, CURRENT_TIMESTAMP),
                COALESCE(t.updated_at, CURRENT_TIMESTAMP)
            FROM legacy_tours t
            LEFT JOIN (
                SELECT
                    tour_id,
                    JSON_ARRAYAGG(poi_id ORDER BY order_index ASC) AS poi_ids
                FROM legacy_tour_pois
                GROUP BY tour_id
            ) tp ON tp.tour_id = t.id
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                language = VALUES(language),
                status = VALUES(status),
                duration = VALUES(duration),
                poi_ids = VALUES(poi_ids),
                updated_at = VALUES(updated_at)
            """
        )
    )


def sync_auto_increment(conn, table_name: str) -> None:
    next_value = conn.execute(text(f'SELECT COALESCE(MAX(id), 0) + 1 FROM {table_name}')).scalar_one()
    conn.execute(text(f'ALTER TABLE {table_name} AUTO_INCREMENT = {int(next_value)}'))


def main() -> None:
    with engine.begin() as conn:
        assert_preconditions(conn)
        migrate_users(conn)
        migrate_pois(conn)
        migrate_tours(conn)

        sync_auto_increment(conn, 'users')
        sync_auto_increment(conn, 'pois')
        sync_auto_increment(conn, 'menu_items')
        sync_auto_increment(conn, 'tours')

    print('Migration completed: legacy_* -> users/pois/menu_items/tours')


if __name__ == '__main__':
    main()
