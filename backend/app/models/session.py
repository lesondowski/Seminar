from sqlalchemy import DateTime, Enum, ForeignKey, String, text
from sqlalchemy.dialects.mysql import BIGINT, TINYINT
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    session_uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    session_scope: Mapped[str] = mapped_column(Enum("visitor", "admin", name="session_scope_enum"), nullable=False)
    session_state: Mapped[str] = mapped_column(Enum("created", "active", "expired", "revoked", name="session_state_enum"), nullable=False)
    site_id: Mapped[int | None] = mapped_column(BIGINT(unsigned=True), ForeignKey("sites.id"), nullable=True)
    user_id: Mapped[int | None] = mapped_column(BIGINT(unsigned=True), ForeignKey("users.id"), nullable=True)
    requires_payment: Mapped[int] = mapped_column(TINYINT, nullable=False, server_default=text("0"))
    bootstrap_version: Mapped[str | None] = mapped_column(String(128), nullable=True)
    refresh_token_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_token_expires_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    refresh_token_expires_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    last_activity_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
