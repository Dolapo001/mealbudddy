from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Wrap DRF errors in a consistent envelope: {"error": {...}}.

    Keeps the original payload under `detail` so existing client handling and
    field-level validation errors still work.
    """
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            "error": {
                "status_code": response.status_code,
                "detail": response.data,
            }
        }
    return response
