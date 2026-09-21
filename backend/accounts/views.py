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

from .supabase_client import get_supabase_client


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
