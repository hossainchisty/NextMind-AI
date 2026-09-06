from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class ServiceError(APIException):
    status_code = 500
    default_detail = "An internal service error occurred."


class NotFoundError(APIException):
    status_code = 404
    default_detail = "The requested resource was not found."


class ForbiddenError(APIException):
    status_code = 403
    default_detail = "You do not have permission to perform this action."


class BadRequestError(APIException):
    status_code = 400
    default_detail = "Bad request."


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        data = response.data
        if isinstance(data, dict):
            message = data.get("detail", "Error")
            errors = {
                k: v for k, v in data.items() if k != "detail"
            }
        elif isinstance(data, list) and data:
            message = str(data[0])
            errors = {}
        else:
            message = "Error"
            errors = {}
        response.data = {
            "success": False,
            "message": message,
            "errors": errors,
        }
    return response
