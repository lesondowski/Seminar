from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal
from app.models.user import User


def main() -> None:
    db = SessionLocal()
    try:
        owner = db.query(User).filter(User.email == 'owner@owner.com').first()
        if owner:
            print(f'owner@owner.com role={owner.role.value}, language={owner.language}')
        else:
            print('owner@owner.com does not exist')

        admin = db.query(User).filter(User.email == 'admin@gmail.com').first()
        if admin:
            print(f'admin@gmail.com role={admin.role.value}')
        else:
            print('admin@gmail.com does not exist')
    finally:
        db.close()


if __name__ == '__main__':
    main()
