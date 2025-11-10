from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler


def custom_exception_handler(exc, context):

    response = drf_default_handler(exc, context)

    if response is None:
        return response

    if isinstance(exc, DRFValidationError):
        return Response(
            {
                "code": "invalid_payload",
                "message": "Invalid request data",
                "extra": response.data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return response
