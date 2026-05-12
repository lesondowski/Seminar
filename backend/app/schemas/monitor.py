from pydantic import BaseModel


class OnlineBySite(BaseModel):
    site_id: int | None
    online_devices: int


class OnlineDevicesResponse(BaseModel):
    window_minutes: int
    total_online_devices: int
    by_site: list[OnlineBySite]
