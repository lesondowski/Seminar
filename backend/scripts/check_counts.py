import sys
from pathlib import Path

from sqlalchemy import create_engine, text

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)

query = text(
    """
    SELECT 'users' AS t, COUNT(*) AS c FROM users
    UNION ALL SELECT 'tours', COUNT(*) FROM tours
    UNION ALL SELECT 'tour_pois', COUNT(*) FROM tour_pois
    UNION ALL SELECT 'restaurants', COUNT(*) FROM restaurants
    UNION ALL SELECT 'pois', COUNT(*) FROM pois
    UNION ALL SELECT 'poi_translations', COUNT(*) FROM poi_translations
    UNION ALL SELECT 'poi_ratings', COUNT(*) FROM poi_ratings
    UNION ALL SELECT 'poi_images', COUNT(*) FROM poi_images
    UNION ALL SELECT 'poi_categories', COUNT(*) FROM poi_categories
    UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
    """
)

with engine.connect() as conn:
    rows = conn.execute(query).fetchall()

for table_name, count in rows:
    print(f'{table_name}: {count}')
