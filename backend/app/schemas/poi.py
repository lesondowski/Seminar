from pydantic import BaseModel, Field


class LocationPayload(BaseModel):
    lat: float
    lng: float


class NarrationPayload(BaseModel):
    sourceLanguage: str = 'vi'
    content: str = ''


class MenuLocalizedField(BaseModel):
    vi: str = ''
    en: str = ''
    zh: str = ''


class MenuItemPayload(BaseModel):
    id: str | None = None
    name: MenuLocalizedField
    description: MenuLocalizedField
    price: int = 0
    currency: str = 'VND'
    image: str = ''
    category: str = 'Other'


class POICreateRequest(BaseModel):
    name: str
    description: str = ''
    price: str = '$$'
    image: str = ''
    category: str = ''
    location: LocationPayload
    rating: float = 0
    phone: str = ''
    website: str = ''
    audio: str = ''
    narration: NarrationPayload = NarrationPayload()
    hours: str = ''
    address: str = ''
    menu: list[MenuItemPayload] = Field(default_factory=list)


class POIUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    price: str | None = None
    image: str | None = None
    category: str | None = None
    location: LocationPayload | None = None
    rating: float | None = None
    phone: str | None = None
    website: str | None = None
    audio: str | None = None
    narration: NarrationPayload | None = None
    hours: str | None = None
    address: str | None = None
    status: str | None = None
    rejectReason: str | None = None
    menu: list[MenuItemPayload] | None = None


class ApprovalRequest(BaseModel):
    rejectReason: str = ''
