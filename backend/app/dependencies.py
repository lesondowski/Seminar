from fastapi import Header


def parse_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip() or None


def get_authorization_token(authorization: str | None = Header(default=None)) -> str | None:
    return parse_bearer_token(authorization)
