import logging

logger = logging.getLogger("apps")


def success_response(data=None, message="Success"):
    return {"success": True, "data": data, "message": message}


def error_response(message="Error", errors=None):
    return {"success": False, "message": message, "errors": errors or {}}
