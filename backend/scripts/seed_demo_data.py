import sys
from pathlib import Path

from sqlalchemy import create_engine, text

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)


def seed_users(conn):
    conn.execute(
        text(
            """
            INSERT INTO users (id, email, language, role)
            VALUES
                (1, 'admin@gmail.com', 'vi', 'admin'),
                (2, 'owner@owner.com', 'vi', 'owner'),
                (3, 'guest@example.com', 'en', 'visitor')
            ON DUPLICATE KEY UPDATE
                email = VALUES(email),
                language = VALUES(language),
                role = VALUES(role)
            """
        )
    )


def seed_restaurants(conn):
    conn.execute(
        text(
            """
            INSERT INTO restaurants (id, owner_id, name, description, phone, status)
            VALUES
                (1, 2, 'Bun Cha Ha Noi', 'Quan bun cha truyen thong', '0909123456', 'approved')
            ON DUPLICATE KEY UPDATE
                owner_id = VALUES(owner_id),
                name = VALUES(name),
                description = VALUES(description),
                phone = VALUES(phone),
                status = VALUES(status)
            """
        )
    )


def seed_categories(conn):
    conn.execute(
        text(
            """
            INSERT INTO poi_categories (id, name, slug)
            VALUES
                (1, 'Pho', 'pho'),
                (2, 'Bun', 'bun')
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                slug = VALUES(slug)
            """
        )
    )


def seed_pois(conn):
    conn.execute(
        text(
            """
            INSERT INTO pois (
                id, name, description, price, image, category, lat, lng, rating, phone, website, audio,
                narration_source_language, narration_content, hours, address, status, reject_reason, owner_id
            )
            VALUES
                (
                    1,
                    'Pho Thin 13 Lo Duc',
                    'Noi tieng voi pho tai lan.',
                    '60-90k',
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                    'Pho',
                    21.0119,
                    105.8574,
                    4.7,
                    '02438212345',
                    'https://example.com/pho-thin',
                    '',
                    'vi',
                    'Pho Thin noi tieng voi huong vi dam da.',
                    '06:00-22:00',
                    '13 Lo Duc, Hai Ba Trung, Ha Noi',
                    'approved',
                    '',
                    2
                ),
                (
                    2,
                    'Bun Cha Huong Lien',
                    'Quan bun cha gan voi truyen thong am thuc Ha Noi.',
                    '50-120k',
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
                    'Bun',
                    21.0180,
                    105.8550,
                    4.8,
                    '02439341234',
                    'https://example.com/huong-lien',
                    '',
                    'vi',
                    'Bun cha nuong than hoa an kem nuoc mam chua ngot.',
                    '08:00-21:30',
                    '24 Le Van Huu, Hai Ba Trung, Ha Noi',
                    'approved',
                    '',
                    2
                )
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
                website = VALUES(website),
                audio = VALUES(audio),
                narration_source_language = VALUES(narration_source_language),
                narration_content = VALUES(narration_content),
                hours = VALUES(hours),
                address = VALUES(address),
                status = VALUES(status),
                reject_reason = VALUES(reject_reason),
                owner_id = VALUES(owner_id)
            """
        )
    )


def seed_menu_items(conn):
    conn.execute(
        text(
            """
            INSERT INTO menu_items (
                id, poi_id, name_vi, name_en, name_zh,
                description_vi, description_en, description_zh,
                price, currency, image, category
            )
            VALUES
                (
                    1, 1,
                    'Pho tai lan', 'Stirred rare beef pho', '炒牛肉河粉',
                    'Nuoc dung dam da, thit bo xao tai.',
                    'Rich broth with quickly stirred beef.',
                    '浓郁汤底，快速翻炒牛肉。',
                    65000, 'VND', '', 'Pho'
                ),
                (
                    2, 1,
                    'Quay nong', 'Crispy dough stick', '油条',
                    'An kem pho cho gion ngon.',
                    'Great crispy side dish for pho.',
                    '搭配河粉口感更佳。',
                    10000, 'VND', '', 'Side'
                ),
                (
                    3, 2,
                    'Bun cha day du', 'Full bun cha set', '全套烤肉米线',
                    'Cha nuong, bun, nem cua be.',
                    'Grilled pork, vermicelli and spring roll.',
                    '烤猪肉、米线与春卷。',
                    120000, 'VND', '', 'Bun'
                )
            ON DUPLICATE KEY UPDATE
                poi_id = VALUES(poi_id),
                name_vi = VALUES(name_vi),
                name_en = VALUES(name_en),
                name_zh = VALUES(name_zh),
                description_vi = VALUES(description_vi),
                description_en = VALUES(description_en),
                description_zh = VALUES(description_zh),
                price = VALUES(price),
                currency = VALUES(currency),
                image = VALUES(image),
                category = VALUES(category)
            """
        )
    )


def seed_translations(conn):
    conn.execute(
        text(
            """
            INSERT INTO poi_translations (
                id, poi_id, language_code, title, description, audio_script, is_auto_translated, source_language
            )
            VALUES
                (1, 1, 'vi', 'Pho Thin 13 Lo Duc', 'Pho bo noi tieng.', 'Gioi thieu Pho Thin', FALSE, 'vi'),
                (2, 1, 'en', 'Pho Thin 13 Lo Duc', 'Famous Hanoi beef noodle soup.', 'Introduction to Pho Thin', TRUE, 'vi'),
                (3, 2, 'vi', 'Bun Cha Huong Lien', 'Bun cha noi tieng.', 'Gioi thieu Bun Cha Huong Lien', FALSE, 'vi'),
                (4, 2, 'en', 'Bun Cha Huong Lien', 'Well-known grilled pork with noodles.', 'Introduction to Bun Cha Huong Lien', TRUE, 'vi')
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                audio_script = VALUES(audio_script),
                is_auto_translated = VALUES(is_auto_translated),
                source_language = VALUES(source_language)
            """
        )
    )


def seed_images(conn):
    conn.execute(
        text(
            """
            INSERT INTO poi_images (id, poi_id, url, display_order, is_primary)
            VALUES
                (1, 1, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 0, TRUE),
                (2, 1, 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17', 1, FALSE),
                (3, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947', 0, TRUE)
            ON DUPLICATE KEY UPDATE
                poi_id = VALUES(poi_id),
                url = VALUES(url),
                display_order = VALUES(display_order),
                is_primary = VALUES(is_primary)
            """
        )
    )


def seed_ratings(conn):
    conn.execute(
        text(
            """
            INSERT INTO poi_ratings (id, user_id, poi_id, rating, comment)
            VALUES
                (1, 3, 1, 5, 'Pho rat ngon'),
                (2, 3, 2, 4, 'Quan dong nhung do an chat luong')
            ON DUPLICATE KEY UPDATE
                user_id = VALUES(user_id),
                poi_id = VALUES(poi_id),
                rating = VALUES(rating),
                comment = VALUES(comment)
            """
        )
    )


def seed_tours(conn):
    conn.execute(
        text(
            """
            INSERT INTO tours (id, name, description, language, status, duration, poi_ids)
            VALUES
                (1, 'Hanoi Street Food Morning', 'Tour thuong thuc am thuc buoi sang', 'VI', 'published', '180 min', CAST('[1,2]' AS JSON))
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                language = VALUES(language),
                status = VALUES(status),
                duration = VALUES(duration),
                poi_ids = VALUES(poi_ids)
            """
        )
    )


def seed_tour_pois(conn):
    conn.execute(
        text(
            """
            INSERT INTO tour_pois (id, tour_id, poi_id, order_index)
            VALUES
                (1, 1, 1, 1),
                (2, 1, 2, 2)
            ON DUPLICATE KEY UPDATE
                tour_id = VALUES(tour_id),
                poi_id = VALUES(poi_id),
                order_index = VALUES(order_index)
            """
        )
    )


def sync_auto_increment(conn, table_name: str) -> None:
    next_value = conn.execute(text(f'SELECT COALESCE(MAX(id), 0) + 1 FROM {table_name}')).scalar_one()
    conn.execute(text(f'ALTER TABLE {table_name} AUTO_INCREMENT = {int(next_value)}'))


def main():
    with engine.begin() as conn:
        seed_users(conn)
        seed_restaurants(conn)
        seed_categories(conn)
        seed_pois(conn)
        seed_menu_items(conn)
        seed_translations(conn)
        seed_images(conn)
        seed_ratings(conn)
        seed_tours(conn)
        seed_tour_pois(conn)

        for table in [
            'users',
            'restaurants',
            'poi_categories',
            'pois',
            'menu_items',
            'poi_translations',
            'poi_images',
            'poi_ratings',
            'tours',
            'tour_pois',
        ]:
            sync_auto_increment(conn, table)

    print('Seed completed for 10 tables.')


if __name__ == '__main__':
    main()
