from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GPS Visitor Experience Backend"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_debug: bool = True

    database_url: str = "mysql+pymysql://gps_user:gps_password@127.0.0.1:3306/gps_visitor_app?charset=utf8mb4"
    redis_url: str = "redis://127.0.0.1:6379/0"

    frontend_base_url: str = "http://localhost:3000"
    jwt_access_secret: str = "replace_with_access_secret"
    jwt_refresh_secret: str = "replace_with_refresh_secret"
    jwt_algorithm: str = "HS256"

    monitor_active_window_minutes: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
