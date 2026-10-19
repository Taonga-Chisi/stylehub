from django.core.management.base import BaseCommand, CommandError

from accounts.supabase_client import get_supabase_admin_client


class Command(BaseCommand):
    help = "Grant the trusted StyleHub administrator role to an existing Supabase user."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Email address of the existing account to promote")

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        if not email:
            raise CommandError("An administrator email address is required.")
        try:
            auth_admin = get_supabase_admin_client().auth.admin
            target = None
            page = 1
            while page <= 100:
                result = auth_admin.list_users(page=page, per_page=100)
                users = getattr(result, "users", result)
                users = users or []
                target = next((user for user in users if (getattr(user, "email", "") or "").lower() == email), None)
                if target or len(users) < 100:
                    break
                page += 1
            if not target:
                raise CommandError("No Supabase account was found with that email. Create the account first.")

            app_metadata = dict(getattr(target, "app_metadata", None) or {})
            app_metadata["role"] = "admin"
            auth_admin.update_user_by_id(str(target.id), {"app_metadata": app_metadata})
        except CommandError:
            raise
        except Exception as exc:
            raise CommandError(f"Could not grant administrator access: {exc}") from exc

        self.stdout.write(self.style.SUCCESS(
            f"Administrator access granted to {email}. Sign out and sign in again to refresh the role token."
        ))
