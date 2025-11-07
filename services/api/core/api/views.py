from rest_framework import status, viewsets, permissions, serializers
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


from core.dtos import ArticleCreateDTO, ArticleUpdateDTO
from core.exceptions import NotFound, ValidationError
from core.services import ArticleService
from core.models import InterestCenter
from core.api.serializers import to_english_theme

from .serializers import (
    ArticleCreateIn,
    ArticleOut,
    ArticleQueryIn,
    ArticleUpdateIn,
    RegisterSerializer,
    UserMeSerializer
    )


class ArticleViewSet(viewsets.ViewSet):
    """
    GET    /api/articles/?theme=...
    POST   /api/articles/
    GET    /api/articles/{id}/
    PATCH  /api/articles/{id}/
    DELETE /api/articles/{id}/
    """

    svc = ArticleService()

    ordering_fields = ["publish_date", "created_at", "theme", "title"]
    ordering = ["-publish_date", "-created_at"]

    def list(self, request: Request) -> Response:
        raw_query = {
            "theme": request.query_params.getlist("theme"),
        }

        q = ArticleQueryIn(data=raw_query)
        q.is_valid(raise_exception=True)

        themes = q.validated_data.get("theme", [])

        if len(themes) == 0:
            themes = None

        user = request.user if request.user and request.user.is_authenticated else None
        items = self.svc.list(user=user, theme=themes)

        dict_items = [ArticleOut(i.__dict__).data for i in items]
        paginator = PageNumberPagination()
        paginator.page_size = 25
        page = paginator.paginate_queryset(dict_items, request)

        ordering_param = request.query_params.get("ordering")
        if ordering_param:
            reverse = ordering_param.startswith("-")
            field = ordering_param.lstrip("-")
            try:
                page.sort(key=lambda x: x.get(field), reverse=reverse)
            except Exception:
                pass

        data = [ArticleOut(obj).data for obj in page]

        response = paginator.get_paginated_response(data)

        response.data['count'] = len(dict_items)

        return response

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


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(UserMeSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserMeSerializer(request.user).data)

    def put(self, request):
        user = request.user
        username = request.data.get("username")
        email = request.data.get("email")
        themes = request.data.get("themes")

        if username:
            user.username = username
        if email:
            user.email = email
        user.save()

        if themes is not None:
            new_themes = {to_english_theme(t) for t in themes}
            user.interest_centers.exclude(theme__in=new_themes).delete()
            existing = set(
                user.interest_centers.values_list("theme", flat=True)
                )
            to_create = new_themes - existing
            for t in to_create:
                InterestCenter.objects.create(user=user, theme=t)

        return Response(UserMeSerializer(user).data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(ser.validated_data["old_password"]):
            return Response({"detail": "Ancien mot de passe incorrect."}, status=400)

        new_password = ser.validated_data["new_password"]
        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response({"detail": e.messages}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Mot de passe modifié."})