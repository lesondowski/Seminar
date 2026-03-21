from sqlmodel import SQLModel, Field, Relationship, Index
from typing import List, Optional
from datetime import datetime

class POI(SQLModel, table=True):
    __table_args__ = (Index("idx_poi_location", "latitude", "longitude"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    latitude: float
    longitude: float
    image: str
    qrcodes: List["QRCode"] = Relationship(back_populates="poi")

class QRCode(SQLModel, table=True):
    __table_args__ = (Index("idx_qr_code", "code"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True)
    poi_id: int = Field(foreign_key="poi.id")
    poi: POI = Relationship(back_populates="qrcodes")

class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    poi_id: int = Field(foreign_key="poi.id")
    completed_at: datetime = Field(default_factory=datetime.now)
    poi: POI = Relationship()