from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal
from app.services.auth_service import admin_create_or_update_user


def main() -> None:
    db = SessionLocal()
    try:
        result = admin_create_or_update_user(
            db=db,
            email='owner.new@example.com',
            language='vi',
            role='owner',
        )
        print(result)
    finally:
        db.close()


if __name__ == '__main__':
    main()
