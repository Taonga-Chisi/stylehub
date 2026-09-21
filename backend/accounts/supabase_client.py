from decouple import config
from supabase import create_client, Client

_client: Client | None = None


def get_supabase_client() -> Client:
    """Return a singleton Supabase client (anon key) for public-facing operations."""
    global _client
    if _client is None:
        url: str = config("SUPABASE_URL")
        key: str = config("SUPABASE_ANON_KEY")
        _client = create_client(url, key)
    return _client


_admin_client: Client | None = None


def get_supabase_admin_client() -> Client:
    """Return a singleton Supabase admin client (service role key) for server-side operations."""
    global _admin_client
    if _admin_client is None:
        url: str = config("SUPABASE_URL")
        key: str = config("SUPABASE_SERVICE_KEY")
        _admin_client = create_client(url, key)
    return _admin_client
