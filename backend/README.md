# Smart Food Tour Backend

FastAPI backend for Smart Food Tour.

## Stack
- FastAPI
- SQLAlchemy 2.0 (sync)
- MySQL
- Redis

## Quick start
1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Current scope
- Auth: OTP send/verify, login, refresh, logout, profile
- POI: CRUD + moderation + nearby + menu update
- Tour: CRUD
- Chatbot: stub endpoint (RAG not included)
- Upload: local file upload

## Excluded for now
- Payment
- RAG internals (to be integrated later)
