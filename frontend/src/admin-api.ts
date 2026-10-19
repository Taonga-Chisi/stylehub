import { supabase } from "./lib/supabase";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://127.0.0.1:8000";

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The admin request could not be completed.");
  return payload as T;
}

export interface ManagedSalon {
  id: string;
  owner_id: string;
  name: string;
  city?: string;
  phone?: string;
  email?: string;
  hours?: string;
  about?: string;
  services?: Array<{ name?: string; price?: number; dur?: string }>;
  logo_url?: string;
  cover_url?: string;
  approval_status: "pending" | "approved" | "rejected";
  is_active?: boolean;
  deactivated_at?: string | null;
  created_at?: string;
  approved_at?: string | null;
}

export interface MonthlyCommission {
  salon_id: string;
  salon_name: string;
  booking_count: number;
  booking_total: number;
  commission_due: number;
}

export async function getAdminSalons() {
  return adminRequest<{ salons: ManagedSalon[] }>("/api/admin/salons/");
}

export async function setSalonApproval(id: string, decision: "approved" | "rejected") {
  return adminRequest<{ salon: ManagedSalon; notice_saved: boolean; email_sent: boolean }>(
    `/api/admin/salons/${encodeURIComponent(id)}/decision/`,
    { method: "POST", body: JSON.stringify({ decision }) },
  );
}

export async function setSalonListing(id: string, is_active: boolean) {
  return adminRequest<{ salon: ManagedSalon }>(
    `/api/admin/salons/${encodeURIComponent(id)}/listing/`,
    { method: "PATCH", body: JSON.stringify({ is_active }) },
  );
}

export async function getMonthlyCommissions(month: string) {
  return adminRequest<{ month: string; rate: number; currency: string; salons: MonthlyCommission[] }>(
    `/api/admin/commissions/?month=${encodeURIComponent(month)}`,
  );
}
