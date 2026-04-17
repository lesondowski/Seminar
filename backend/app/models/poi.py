from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class POIStatus(str, Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class POI(Base):
    __tablename__ = 'pois'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default='', nullable=False)
    price: Mapped[str] = mapped_column(String(20), default='$$', nullable=False)
    image: Mapped[str] = mapped_column(String(512), default='', nullable=False)
    category: Mapped[str] = mapped_column(String(100), default='', nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), default='', nullable=False)
    website: Mapped[str] = mapped_column(String(255), default='', nullable=False)
    audio: Mapped[str] = mapped_column(String(512), default='', nullable=False)
    narration_source_language: Mapped[str] = mapped_column(String(10), default='vi', nullable=False)
    narration_content: Mapped[str] = mapped_column(Text, default='', nullable=False)
    hours: Mapped[str] = mapped_column(String(100), default='', nullable=False)
    address: Mapped[str] = mapped_column(Text, default='', nullable=False)
    status: Mapped[POIStatus] = mapped_column(SQLEnum(POIStatus), default=POIStatus.pending, nullable=False)
    reject_reason: Mapped[str] = mapped_column(Text, default='', nullable=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    owner = relationship('User', back_populates='pois', foreign_keys=[owner_id])
    creator = relationship('User', foreign_keys=[created_by])
    menu_items = relationship('MenuItem', back_populates='poi', cascade='all, delete-orphan')
