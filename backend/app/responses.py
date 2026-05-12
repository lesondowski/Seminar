from fastapi.responses import JSONResponse


def ok(data, status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data, "error": None},
    )


def fail(code: str, message: str, status_code: int):
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "data": None, "error": {"code": code, "message": message}},
    )
