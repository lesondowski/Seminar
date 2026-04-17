from pydantic import BaseModel


class APIMessage(BaseModel):
    message: str


class PaginationQuery(BaseModel):
    limit: int = 20
    offset: int = 0
