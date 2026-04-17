from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = 'Smart Food Tour Backend'
    app_env: str = 'development'
    api_prefix: str = '/api/v1'
    backend_cors_origins: str = 'http://localhost:3000,http://localhost:3001'

    mysql_host: str = 'localhost'
    mysql_port: int = 3306
    mysql_user: str = 'root'
    mysql_password: str = 'change_me'
    mysql_db: str = 'smart_food_tour'

    redis_url: str = 'redis://localhost:6379/0'

    jwt_secret_key: str = 'change_this_secret_key'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    upload_dir: str = 'uploads'

    @property
    def sqlalchemy_database_uri(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}@"
            f"{self.mysql_host}:{self.mysql_port}/{self.mysql_db}?charset=utf8mb4"
        )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(',') if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
