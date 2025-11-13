from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ArticleViewSet,
    BestPracticeViewSet,
    ChangePasswordView,
    MeView,
    RegisterView,
    my_favorites,
    toggle_favorite,
)

router = DefaultRouter()
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"best-practices", BestPracticeViewSet, basename="best-practices")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view()),
    path("auth/change-password/", ChangePasswordView.as_view()),
    path("favorites/toggle/", toggle_favorite, name="favorite-toggle"),
    path("favorites/mine/", my_favorites, name="favorite-mine"),
]
