from pydantic import BaseModel, Field


class TourCreateRequest(BaseModel):
    name: str
    description: str = ''
    language: str = 'VI'
    status: str = 'draft'
    duration: str = ''
    pois: list[int] = Field(default_factory=list)


class TourUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    language: str | None = None
    status: str | None = None
    duration: str | None = None
    pois: list[int] | None = None
