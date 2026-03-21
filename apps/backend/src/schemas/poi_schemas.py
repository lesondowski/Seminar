from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class POIBase(BaseModel):
    name: str
    description: str
    latitude: float
    longitude: float
    image: str

class POICreate(POIBase):
    pass

class POIRead(POIBase):
    id: int
    qrcodes: List["QRCodeRead"] = []

class QRCodeBase(BaseModel):
    code: str

class QRCodeCreate(QRCodeBase):
    poi_id: int

class QRCodeRead(QRCodeBase):
    id: int
    poi_id: int

class ProgressBase(BaseModel):
    user_id: str
    poi_id: int

class ProgressCreate(ProgressBase):
    pass

class ProgressRead(ProgressBase):
    id: int
    completed_at: datetime