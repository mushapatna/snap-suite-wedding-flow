from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import WeddingProject


class AuthSmokeTests(APITestCase):
    def setUp(self):
        self.password = "TestPass123!"
        self.user = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password=self.password,
        )

    def test_login_with_username_returns_token(self):
        response = self.client.post(
            "/api/login/",
            {"username": self.user.username, "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["email"], self.user.email)

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/login/",
            {"username": self.user.username, "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProjectPermissionsSmokeTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner2",
            email="owner2@example.com",
            password="TestPass123!",
        )
        self.other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="TestPass123!",
        )

        self.owner_project = WeddingProject.objects.create(
            user=self.owner,
            couple_name="Alice & Bob",
            event_date="2026-06-01",
            event_type="Wedding",
            location="Nairobi",
            service_type="Photo + Video",
            status="active",
        )
        WeddingProject.objects.create(
            user=self.other_user,
            couple_name="Chris & Dana",
            event_date="2026-08-01",
            event_type="Wedding",
            location="Mombasa",
            service_type="Photo",
            status="active",
        )

    def test_authenticated_user_only_sees_own_projects(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.owner_project.id))

    def test_unauthenticated_user_cannot_list_projects(self):
        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
