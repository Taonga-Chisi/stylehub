from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from .views import AdminSalonListingView, _admin_request_user, _build_commission_rows, _month_window_utc


class MonthlyCommissionTests(SimpleTestCase):
    def test_commission_is_five_percent_of_non_cancelled_bookings(self):
        salons = [{"id": "salon-1", "name": "Braids & Beauty"}]
        bookings = [
            {"salon_id": "salon-1", "service_price": 1500, "status": "pending"},
            {"salon_id": "salon-1", "service_price": 2500, "status": "completed"},
            {"salon_id": "salon-1", "service_price": 800, "status": "cancelled"},
        ]

        rows = _build_commission_rows(salons, bookings)

        self.assertEqual(rows[0]["booking_count"], 2)
        self.assertEqual(rows[0]["booking_total"], 4000.0)
        self.assertEqual(rows[0]["commission_due"], 200.0)

    def test_fractional_commission_is_rounded_to_two_decimal_places(self):
        rows = _build_commission_rows(
            [{"id": "salon-1", "name": "Salon"}],
            [{"salon_id": "salon-1", "service_price": 333, "status": "approved"}],
        )

        self.assertEqual(rows[0]["commission_due"], 16.65)

    def test_month_bounds_use_africa_lusaka_calendar(self):
        start, end = _month_window_utc("2026-04")

        self.assertEqual(start, datetime(2026, 3, 31, 22, 0, tzinfo=timezone.utc))
        self.assertEqual(end, datetime(2026, 4, 30, 22, 0, tzinfo=timezone.utc))


class AdminAccessTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_admin_endpoint_requires_bearer_token(self):
        request = self.factory.get("/api/admin/salons/")

        _, denied = _admin_request_user(request)

        self.assertEqual(denied.status_code, 401)

    @patch("accounts.views.get_supabase_client")
    def test_regular_user_is_not_an_admin(self, get_client):
        get_client.return_value.auth.get_user.return_value.user = SimpleNamespace(app_metadata={"role": "client"})
        request = self.factory.get("/api/admin/salons/", HTTP_AUTHORIZATION="Bearer test-token")

        _, denied = _admin_request_user(request)

        self.assertEqual(denied.status_code, 403)

    @patch("accounts.views.get_supabase_client")
    def test_admin_role_is_read_from_trusted_app_metadata(self, get_client):
        expected_user = SimpleNamespace(app_metadata={"role": "admin"})
        get_client.return_value.auth.get_user.return_value.user = expected_user
        request = self.factory.get("/api/admin/salons/", HTTP_AUTHORIZATION="Bearer admin-token")

        user, denied = _admin_request_user(request)

        self.assertIs(user, expected_user)
        self.assertIsNone(denied)


class AdminSalonListingTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.salon_id = "f2af21c2-542b-4d60-95d6-571f13478bcd"

    @patch("accounts.views.get_supabase_admin_client")
    @patch("accounts.views.get_supabase_client")
    def test_admin_can_remove_a_salon_from_public_listing(self, get_client, get_admin_client):
        get_client.return_value.auth.get_user.return_value.user = SimpleNamespace(app_metadata={"role": "admin"})
        get_admin_client.return_value.rpc.return_value.execute.return_value.data = [
            {"id": self.salon_id, "is_active": False, "deactivated_at": "2026-10-19T00:00:00+00:00"}
        ]
        request = self.factory.patch(
            f"/api/admin/salons/{self.salon_id}/listing/",
            {"is_active": False},
            format="json",
            HTTP_AUTHORIZATION="Bearer admin-token",
        )

        response = AdminSalonListingView.as_view()(request, salon_id=self.salon_id)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["salon"]["is_active"])
        get_admin_client.return_value.rpc.assert_called_once_with(
            "admin_set_salon_active",
            {"p_salon_id": self.salon_id, "p_is_active": False},
        )

    @patch("accounts.views.get_supabase_client")
    def test_listing_status_must_be_boolean(self, get_client):
        get_client.return_value.auth.get_user.return_value.user = SimpleNamespace(app_metadata={"role": "admin"})
        request = self.factory.patch(
            f"/api/admin/salons/{self.salon_id}/listing/",
            {"is_active": "false"},
            format="json",
            HTTP_AUTHORIZATION="Bearer admin-token",
        )

        response = AdminSalonListingView.as_view()(request, salon_id=self.salon_id)

        self.assertEqual(response.status_code, 400)

