# GPS Vinh Khanh

Du an web app ho tro khach tham quan:
- Dang nhap bang so dien thoai
- Xem POI tren ban do, tim kiem POI
- Xem tour va theo doi tien trinh tour
- Nghe audio mo ta POI
- Co khu vuc quan tri cho Admin/Manager

## Cau truc chinh

- `backend/`: FastAPI + SQLAlchemy
- `frontend/`: Next.js
- `backend/sql/`: script khoi tao schema va seed du lieu
- `docs/`: tai lieu nghiep vu, thiet ke
- `diagram/`: cac so do use case, ERD, sequence

## Yeu cau moi truong

- Python 3.10+
- Node.js 18+
- MySQL 8+
- Redis 6+

## Chay backend local

1. Di chuyen vao thu muc backend:

```powershell
cd backend
```

2. Chay script local:

```powershell
.\scripts\run_local.ps1
```

Script se:
- Tao `.venv` neu chua co
- Cai dependency tu `requirements.txt`
- Tao `.env` tu `.env.example` neu chua co
- Nhac ban chay SQL scripts thu cong
- Chay server FastAPI tai cong 8000

Thu tu SQL de chay trong MySQL:
1. `backend/sql/001_init_schema.sql`
2. `backend/sql/002_seed_local.sql`
3. `backend/sql/003_smoke_checks.sql`

## Chay frontend local

1. Di chuyen vao thu muc frontend:

```powershell
cd frontend
```

2. Cai dependency:

```powershell
npm install
```

3. Chay dev server:

```powershell
npm run dev
```

Frontend mac dinh chay tai: http://localhost:3000

## Lenh hay dung

### Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run start
```

## Ghi chu

- Cau hinh backend nam o `backend/.env`.
- Mau cau hinh o `backend/.env.example`.
- Neu co thay doi schema, cap nhat them trong `backend/sql/`.
