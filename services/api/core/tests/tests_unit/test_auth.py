from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from core.models import InterestCenter

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"
        self.change_pwd_url = "/api/auth/change-password/"

    def test_register_ok(self):
        payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "Azerty!1",
            "themes": ["security", "cloud"],
        }
        res = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["username"], "alice")
        user = User.objects.get(username="alice")
        themes = list(user.interest_centers.values_list("theme", flat=True))
        self.assertIn("sécurité", themes)

    def test_register_weak_password(self):
        payload = {
            "username": "bob",
            "email": "bob@example.com",
            "password": "toto",
        }
        res = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(res.status_code, 400)

    def test_login_ok(self):
        _ = User.objects.create_user(
            username="charlie",
            email="charlie@example.com",
            password="Azerty!1",
        )
        res = self.client.post(
            self.login_url,
            {"username": "charlie", "password": "Azerty!1"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_bad_password(self):
        _ = User.objects.create_user(
            username="david",
            email="david@example.com",
            password="Azerty!1",
        )
        res = self.client.post(
            self.login_url, {"username": "david", "password": "mauvais"}, format="json"
        )
        self.assertEqual(res.status_code, 401)

    def test_me_requires_auth(self):
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 401)

    def test_me_returns_user_and_themes(self):
        user = User.objects.create_user(
            username="emma",
            email="emma@example.com",
            password="Azerty!1",
        )
        InterestCenter.objects.create(user=user, theme="sécurité")

        login_res = self.client.post(
            self.login_url, {"username": "emma", "password": "Azerty!1"}, format="json"
        )
        access = login_res.data["access"]

        res = self.client.get(self.me_url, HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "emma")
        self.assertIn("security", res.data["themes"])

    def test_change_password(self):
        _ = User.objects.create_user(
            username="fred",
            email="fred@example.com",
            password="Azerty!1",
        )
        login_res = self.client.post(
            self.login_url, {"username": "fred", "password": "Azerty!1"}, format="json"
        )
        access = login_res.data["access"]

        payload = {
            "old_password": "Azerty!1",
            "new_password": "Nouveau!2",
            "confirm_password": "Nouveau!2",
        }
        res = self.client.post(
            self.change_pwd_url,
            payload,
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(res.status_code, 200)

        login_res2 = self.client.post(
            self.login_url, {"username": "fred", "password": "Nouveau!2"}, format="json"
        )
        self.assertEqual(login_res2.status_code, 200)
