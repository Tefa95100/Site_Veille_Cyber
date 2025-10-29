from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.request import Request

from core.services import ArticleService
from core.dtos import ArticleCreateDTO, ArticleUpdateDTO
from core.exceptions import ValidationError, NotFound
from .serializers import ArticleCreateIn, ArticleUpdateIn, ArticleOut


class ArticleViewSet(viewsets.ViewSet):
    """
    GET    /api/articles/?theme=...
    POST   /api/articles/
    GET    /api/articles/{id}/
    PATCH  /api/articles/{id}/
    DELETE /api/articles/{id}/
    """

    svc = ArticleService()

    def list(self, request: Request) -> Response:
        theme = request.query_params.get("theme")
        items = self.svc.list(theme=theme)
        data = [ArticleOut(i.__dict__).data for i in items]
        return Response(data, status=200)

    def retrieve(self, request: Request, pk=None) -> Response:
        try:
            dto = self.svc.get(int(pk))
            return Response(ArticleOut(dto.__dict__).data, status=200)
        except NotFound as e:
            return Response({"code": e.code, "message": e.message}, status=404)

    def create(self, request: Request) -> Response:
        ser = ArticleCreateIn(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            dto = self.svc.create(ArticleCreateDTO(**ser.validated_data))
            return Response(
                ArticleOut(dto.__dict__).data, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {"code": e.code, "message": e.message, "extra": e.extra}, status=400
            )

    def partial_update(self, request: Request, pk=None) -> Response:
        ser = ArticleUpdateIn(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        try:
            dto = self.svc.update(int(pk), ArticleUpdateDTO(**ser.validated_data))
            return Response(ArticleOut(dto.__dict__).data, status=200)
        except NotFound as e:
            return Response({"code": e.code, "message": e.message}, status=404)
        except ValidationError as e:
            return Response(
                {"code": e.code, "message": e.message, "extra": e.extra}, status=400
            )

    def destroy(self, request: Request, pk=None) -> Response:
        try:
            self.svc.delete(int(pk))
            return Response(status=204)
        except NotFound as e:
            return Response({"code": e.code, "message": e.message}, status=404)
