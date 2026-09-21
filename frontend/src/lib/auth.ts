/**
 * auth.ts — Thin wrappers around Supabase Auth for StyleHub.
 *
 * All auth state changes are also observable via:
 *   supabase.auth.onAuthStateChange((event, session) => { ... })
 */

import { supabase } from "./supabase";
import type { Session, User, AuthError } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * @param full_name  Display name stored in user_metadata.
 */
export async function signUp(
  email: string,
  password: string,
  full_name: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  return {
    user: data.user ?? null,
    session: data.session ?? null,
    error: error ? _humaniseError(error) : null,
  };
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

/**
 * Sign in an existing user with email + password.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user ?? null,
    session: data.session ?? null,
    error: error ? _humaniseError(error) : null,
  };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Sign out the currently authenticated user and clear the local session.
 */
export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? _humaniseError(error) : null };
}

// ─── Get current session ──────────────────────────────────────────────────────

/**
 * Return the current session (may be null if not logged in).
 * This reads from localStorage — no network request.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Return the currently authenticated user (or null).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _humaniseError(error: AuthError): string {
  // Map Supabase error messages to user-friendly strings
  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Please sign in.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("unable to validate email address")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  // Fallback to raw message
  return error.message;
}
