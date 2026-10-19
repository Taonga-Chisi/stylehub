"""
Authentication views — proxies to Supabase Auth.

Endpoints:
  POST /api/auth/signup   { email, password, full_name }
  POST /api/auth/login    { email, password }
  POST /api/auth/logout   (Bearer token in Authorization header)
  GET  /api/auth/me       (Bearer token in Authorization header)
"""



from supabase_auth.errors import AuthApiError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID
from zoneinfo import ZoneInfo
from django.conf import settings
from django.core.mail import send_mail

from .supabase_client import get_supabase_admin_client, get_supabase_client


def _extract_bearer(request) -> str | None:
    """Pull JWT from Authorization: Bearer <token> header."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1]
    return None


class SignUpView(APIView):
    """
    Register a new client user via Supabase Auth.

    Request body:
        {
            "email": "user@example.com",
            "password": "secret123",
            "full_name": "Amara Diallo"   (optional)
        }

    On success, Supabase sends a confirmation email (if email confirm is enabled).
    Returns the user object and session tokens.
    """

    def post(self, request):
        body = request.data
        email: str = body.get("email", "").strip()
        password: str = body.get("password", "")
        full_name: str = body.get("full_name", "").strip()

        if not email or not password:
            return Response(
                {"error": "email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        supabase = get_supabase_client()

        try:
            res = supabase.auth.sign_up(
                {
                    "email": email,
                    "password": password,
                    "options": {
                        "data": {"full_name": full_name},
                    },
                }
            )
        except AuthApiError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user = res.user
        session = res.session

        return Response(
            {
                "message": "Account created successfully.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.user_metadata.get("full_name", ""),
                },
                "session": (
                    {
                        "access_token": session.access_token,
                        "refresh_token": session.refresh_token,
                        "expires_at": session.expires_at,
                    }
                    if session
                    else None
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Authenticate an existing user via email + password.

    Request body:
        {
            "email": "user@example.com",
            "password": "secret123"
        }

    Returns JWT access token, refresh token, and basic user info.
    """

    def post(self, request):
        body = request.data
        email: str = body.get("email", "").strip()
        password: str = body.get("password", "")

        if not email or not password:
            return Response(
                {"error": "email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        supabase = get_supabase_client()

        try:
            res = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
        except AuthApiError as exc:
            return Response(
                {"error": "Invalid credentials. Please check your email and password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = res.user
        session = res.session

        return Response(
            {
                "message": "Logged in successfully.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.user_metadata.get("full_name", ""),
                },
                "session": {
                    "access_token": session.access_token,
                    "refresh_token": session.refresh_token,
                    "expires_at": session.expires_at,
                },
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    Revoke the current session token.

    Requires: Authorization: Bearer <access_token>
    """

    def post(self, request):
        token = _extract_bearer(request)
        if not token:
            return Response(
                {"error": "No access token provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        supabase = get_supabase_client()

        try:
            # Set the session so Supabase knows which session to revoke
            supabase.auth.set_session(token, "")
            supabase.auth.sign_out()
        except Exception:
            pass  # Even if revocation fails on the server side, client should clear tokens

        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    Return the current authenticated user's profile.

    Requires: Authorization: Bearer <access_token>
    """

    def get(self, request):
        token = _extract_bearer(request)
        if not token:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        supabase = get_supabase_client()

        try:
            res = supabase.auth.get_user(token)
            user = res.user
        except AuthApiError as exc:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.user_metadata.get("full_name", ""),
                }
            },
            status=status.HTTP_200_OK,
        )


def _admin_request_user(request):
    """Validate a Supabase access token and require trusted app_metadata role."""
    token = _extract_bearer(request)
    if not token:
        return None, Response({"error": "Sign in with an administrator account."}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        user = get_supabase_client().auth.get_user(token).user
    except Exception:
        return None, Response({"error": "The session is invalid or has expired."}, status=status.HTTP_401_UNAUTHORIZED)
    app_metadata = getattr(user, "app_metadata", None) or {}
    if app_metadata.get("role") != "admin":
        return None, Response({"error": "Administrator access is required."}, status=status.HTTP_403_FORBIDDEN)
    return user, None


def _admin_data_client():
    """Use the server-only Supabase service key for privileged data operations."""
    try:
        return get_supabase_admin_client()
    except Exception as exc:
        raise RuntimeError("Server-side Supabase service credentials are not configured.") from exc


def _month_window_utc(month: str):
    """Convert a YYYY-MM Africa/Lusaka calendar month to UTC query bounds."""
    billing_zone = ZoneInfo("Africa/Lusaka")
    month_start_local = datetime.strptime(month, "%Y-%m").replace(tzinfo=billing_zone)
    if month_start_local.month == 12:
        month_end_local = month_start_local.replace(year=month_start_local.year + 1, month=1)
    else:
        month_end_local = month_start_local.replace(month=month_start_local.month + 1)
    return month_start_local.astimezone(timezone.utc), month_end_local.astimezone(timezone.utc)


def _build_commission_rows(salons, bookings):
    """Return per-salon totals using 5% of booking value, excluding cancellations."""
    totals = {
        str(salon["id"]): {
            "salon_id": str(salon["id"]),
            "salon_name": salon.get("name") or "Salon",
            "booking_count": 0,
            "booking_total": Decimal("0.00"),
        }
        for salon in salons
    }
    for booking in bookings:
        if booking.get("status") == "cancelled":
            continue
        salon_id = str(booking.get("salon_id") or "")
        if salon_id not in totals:
            totals[salon_id] = {
                "salon_id": salon_id,
                "salon_name": "Salon",
                "booking_count": 0,
                "booking_total": Decimal("0.00"),
            }
        totals[salon_id]["booking_count"] += 1
        totals[salon_id]["booking_total"] += Decimal(str(booking.get("service_price") or 0))

    rows = []
    for item in totals.values():
        booking_total = item["booking_total"].quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        commission = (booking_total * Decimal("0.05")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        rows.append({
            **item,
            "booking_total": float(booking_total),
            "commission_due": float(commission),
        })
    rows.sort(key=lambda row: row["commission_due"], reverse=True)
    return rows


class AdminSalonsView(APIView):
    """List salon applications for an authenticated StyleHub administrator."""

    def get(self, request):
        _, denied = _admin_request_user(request)
        if denied:
            return denied
        try:
            result = _admin_data_client().table("salons").select("*").execute()
            salons = result.data or []
            salons.sort(key=lambda salon: salon.get("created_at") or "", reverse=True)
            return Response({"salons": salons}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"error": f"Could not load salon registrations: {exc}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AdminSalonDecisionView(APIView):
    """Approve or reject a salon and create its commission notice."""

    def post(self, request, salon_id):
        _, denied = _admin_request_user(request)
        if denied:
            return denied
        decision = request.data.get("decision")
        if decision not in {"approved", "rejected"}:
            return Response({"error": "Decision must be approved or rejected."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = _admin_data_client()
            existing_result = client.table("salons").select("*").eq("id", str(salon_id)).limit(1).execute()
            if not existing_result.data:
                return Response({"error": "Salon registration was not found."}, status=status.HTTP_404_NOT_FOUND)
            salon = existing_result.data[0]
            was_approved = salon.get("approval_status") == "approved"
            update = {
                "approval_status": decision,
                "approved_at": datetime.now(timezone.utc).isoformat() if decision == "approved" else None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            updated_result = client.table("salons").update(update).eq("id", str(salon_id)).select("*").execute()
            if not updated_result.data:
                return Response({"error": "The salon status could not be updated."}, status=status.HTTP_409_CONFLICT)
            salon = updated_result.data[0]

            notice_saved = False
            email_sent = False
            if decision == "approved" and not was_approved:
                owner_email = (salon.get("email") or "").strip()
                if not owner_email and salon.get("owner_id"):
                    try:
                        owner = client.auth.admin.get_user_by_id(str(salon["owner_id"])).user
                        owner_email = getattr(owner, "email", "") or ""
                    except Exception:
                        owner_email = ""

                title = "Your salon is approved on StyleHub"
                message = (
                    f"{salon.get('name', 'Your salon')} is now approved and operational on StyleHub. "
                    "StyleHub's monthly commission is 5% of the total value of this salon's bookings "
                    "created during the month. Cancelled bookings are excluded."
                )
                try:
                    client.table("salon_notifications").insert({
                        "owner_id": salon["owner_id"],
                        "salon_id": salon["id"],
                        "notification_type": "salon_approved",
                        "title": title,
                        "message": message,
                    }).execute()
                    notice_saved = True
                except Exception:
                    # The salon approval remains successful, but the response exposes
                    # that the database notification could not be written.
                    notice_saved = False

                if owner_email and getattr(settings, "EMAIL_HOST", ""):
                    try:
                        send_mail(
                            subject=title,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[owner_email],
                            fail_silently=False,
                        )
                        email_sent = True
                    except Exception:
                        email_sent = False

            return Response({"salon": salon, "notice_saved": notice_saved, "email_sent": email_sent}, status=status.HTTP_200_OK)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": f"Could not process salon decision: {exc}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AdminSalonListingView(APIView):
    """Remove or restore a salon's public listing without deleting its history."""

    def patch(self, request, salon_id):
        _, denied = _admin_request_user(request)
        if denied:
            return denied

        is_active = request.data.get("is_active")
        if not isinstance(is_active, bool):
            return Response({"error": "is_active must be true or false."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            normalized_id = str(UUID(str(salon_id)))
        except (ValueError, TypeError, AttributeError):
            return Response({"error": "A valid salon ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = _admin_data_client().rpc(
                "admin_set_salon_active",
                {"p_salon_id": normalized_id, "p_is_active": is_active},
            ).execute()
            salons = result.data or []
            if not salons:
                return Response({"error": "Salon was not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"salon": salons[0]}, status=status.HTTP_200_OK)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": f"Could not update the salon listing: {exc}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AdminMonthlyCommissionsView(APIView):
    """Calculate 5% of uncancelled booking value created in the requested month."""

    def get(self, request):
        _, denied = _admin_request_user(request)
        if denied:
            return denied

        month = request.query_params.get("month", datetime.now(timezone.utc).strftime("%Y-%m"))
        try:
            month_start, month_end = _month_window_utc(month)
        except ValueError:
            return Response({"error": "Month must use YYYY-MM format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = _admin_data_client()
            salons_result = client.table("salons").select("id,name").execute()
            bookings_result = (
                client.table("bookings")
                .select("salon_id,service_price,status,created_at")
                .gte("created_at", month_start.isoformat())
                .lt("created_at", month_end.isoformat())
                .neq("status", "cancelled")
                .execute()
            )
            rows = _build_commission_rows(salons_result.data or [], bookings_result.data or [])
            return Response({"month": month, "rate": 5, "currency": "ZMW", "salons": rows}, status=status.HTTP_200_OK)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": f"Could not calculate commissions: {exc}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
