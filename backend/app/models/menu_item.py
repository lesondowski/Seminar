from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MenuItem(Base):
    __tablename__ = 'menu_items'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    poi_id: Mapped[int] = mapped_column(ForeignKey('pois.id'), nullable=False, index=True)

    name_vi: Mapped[str] = mapped_column(String(255), default='', nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), default='', nullable=False)
    name_zh: Mapped[str] = mapped_column(String(255), default='', nullable=False)

    description_vi: Mapped[str] = mapped_column(Text, default='', nullable=False)
    description_en: Mapped[str] = mapped_column(Text, default='', nullable=False)
    description_zh: Mapped[str] = mapped_column(Text, default='', nullable=False)

    price: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default='VND', nullable=False)
    image: Mapped[str] = mapped_column(String(512), default='', nullable=False)
    category: Mapped[str] = mapped_column(String(100), default='Other', nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    poi = relationship('POI', back_populates='menu_items')
