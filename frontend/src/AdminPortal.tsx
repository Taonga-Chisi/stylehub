import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signIn } from "./lib/auth";
import { supabase } from "./lib/supabase";
import { getAdminSalons, getMonthlyCommissions, setSalonApproval, setSalonListing } from "./admin-api";
import type { ManagedSalon, MonthlyCommission } from "./admin-api";

type AdminTab = "overview" | "salons" | "commissions";

function money(value: number) {
  return `ZMW ${Number(value || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function currentCalendarMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function AdminLoginPage({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await signIn(email.trim(), password);
    if (result.error || !result.user) {
      setError(result.error || "Sign in failed. Check your details and try again.");
      setBusy(false);
      return;
    }
    if (result.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setBusy(false);
      return;
    }
    onSuccess();
  }

  return (
    <main className="min-h-[75vh] px-4 py-16 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border bg-white p-7 sm:p-9 shadow-sm" style={{ borderColor: "#E8E0D5" }}>
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl text-xl text-white" style={{ background: "linear-gradient(135deg,#C4955A,#2C1810)" }}>✦</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em]" style={{ color: "#C4955A" }}>StyleHub</p>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#2C1810" }}>Administrator sign in</h1>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6" style={{ color: "#8B7355" }}>Use your private administrator account to review salon registrations and monthly commission records.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold" style={{ color: "#5C3A21" }}>Administrator email</label>
            <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#C4955A]" style={{ borderColor: "#E8E0D5" }} />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold" style={{ color: "#5C3A21" }}>Password</label>
            <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#C4955A]" style={{ borderColor: "#E8E0D5" }} />
          </div>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button disabled={busy} className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "#2C1810" }}>{busy ? "Signing in…" : "Sign in securely"}</button>
          <button type="button" onClick={onCancel} className="w-full rounded-xl px-4 py-2 text-sm font-medium" style={{ color: "#8B7355" }}>Return to StyleHub</button>
        </form>
        <p className="mt-5 border-t pt-4 text-xs leading-5" style={{ borderColor: "#F2EDE5", color: "#8B7355" }}>Administrator access is assigned by the system owner. Salon and customer accounts cannot access this portal.</p>
      </section>
    </main>
  );
}

function AdminDashboardPage({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [salons, setSalons] = useState<ManagedSalon[]>([]);
  const [rows, setRows] = useState<MonthlyCommission[]>([]);
  const [month, setMonth] = useState(currentCalendarMonth());
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadSalons() {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminSalons();
      setSalons(result.salons || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load salon registrations.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCommissions(selectedMonth: string) {
    setCommissionLoading(true);
    try {
      const result = await getMonthlyCommissions(selectedMonth);
      setRows(result.salons || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load commission totals.");
    } finally {
      setCommissionLoading(false);
    }
  }

  useEffect(() => { void loadSalons(); }, []);
  useEffect(() => { void loadCommissions(month); }, [month]);

  const pending = salons.filter(s => s.approval_status === "pending").length;
  const approved = salons.filter(s => s.approval_status === "approved" && s.is_active !== false).length;
  const commissionTotal = rows.reduce((sum, row) => sum + Number(row.commission_due || 0), 0);
  const bookingTotal = rows.reduce((sum, row) => sum + Number(row.booking_total || 0), 0);
  const filteredSalons = useMemo(() => salons.filter(s => {
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "inactive" ? s.is_active === false : s.approval_status === statusFilter);
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [s.name, s.city, s.email, s.phone].some(value => String(value || "").toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }), [salons, statusFilter, search]);

  async function decide(salon: ManagedSalon, decision: "approved" | "rejected") {
    const actionText = decision === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${actionText} ${salon.name}?`)) return;
    setBusyId(salon.id);
    setError("");
    setNotice("");
    try {
      const result = await setSalonApproval(salon.id, decision);
      setNotice(decision === "approved"
        ? `${salon.name} is approved. ${result.email_sent ? "An email was sent" : result.notice_saved ? "An in-app notice was saved" : "The notice could not be delivered; check the salon_notifications table and email settings"}. The 5% monthly commission excludes cancelled bookings.`
        : `${salon.name} was marked as not approved.`);
      await loadSalons();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Could not ${actionText} this salon.`);
    } finally {
      setBusyId(null);
    }
  }

  async function changeSalonListing(salon: ManagedSalon, isActive: boolean) {
    const detail = isActive
      ? `Restore ${salon.name}'s listing? It will appear publicly if it is approved.`
      : `Remove ${salon.name} from public StyleHub search? Its booking and commission history will be kept, and you can restore the listing later.`;
    if (!window.confirm(detail)) return;
    setBusyId(salon.id);
    setError("");
    setNotice("");
    try {
      await setSalonListing(salon.id, isActive);
      setNotice(isActive
        ? salon.approval_status === "approved"
          ? `${salon.name} has been restored to public search.`
          : `${salon.name}'s listing was restored. It remains hidden until it is approved.`
        : `${salon.name} has been removed from public search. Its booking and commission history remain available.`);
      await loadSalons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update this salon listing.");
    } finally {
      setBusyId(null);
    }
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "salons", label: "Salon approvals" },
    { id: "commissions", label: "Monthly commission" },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em]" style={{ color: "#C4955A" }}>StyleHub administration</p>
            <h1 className="mt-1 font-display text-3xl font-semibold" style={{ color: "#2C1810" }}>Admin dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: "#8B7355" }}>Signed in as {user.email}</p>
          </div>
          <button onClick={onSignOut} className="self-start rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#F2EDE5] sm:self-auto" style={{ borderColor: "#E8E0D5", color: "#2C1810" }}>Sign out</button>
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b pb-2" style={{ borderColor: "#E8E0D5" }}>
          {tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === item.id ? "bg-[#2C1810] text-white" : "text-[#8B7355] hover:bg-white"}`}>{item.label}</button>)}
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

        {tab !== "commissions" && (
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Salon registrations", value: salons.length, hint: "All submitted listings" },
              { label: "Awaiting review", value: pending, hint: "Need an approval decision" },
              { label: "Operational salons", value: approved, hint: "Visible to StyleHub clients" },
            ].map(card => <div key={card.label} className="rounded-2xl border bg-white p-5" style={{ borderColor: "#E8E0D5" }}><p className="text-sm" style={{ color: "#8B7355" }}>{card.label}</p><p className="mt-2 font-display text-3xl font-semibold" style={{ color: "#2C1810" }}>{card.value}</p><p className="mt-1 text-xs" style={{ color: "#A48B71" }}>{card.hint}</p></div>)}
          </section>
        )}

        {tab === "overview" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "#E8E0D5" }}>
              <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold" style={{ color: "#2C1810" }}>Pending salon registrations</h2><p className="mt-1 text-xs" style={{ color: "#8B7355" }}>Review details before enabling a listing.</p></div><button onClick={() => setTab("salons")} className="text-xs font-semibold" style={{ color: "#B17D3D" }}>View all →</button></div>
              {loading ? <p className="py-8 text-center text-sm" style={{ color: "#8B7355" }}>Loading registrations…</p> : salons.filter(s => s.approval_status === "pending").slice(0, 4).map(s => <div key={s.id} className="flex items-center gap-3 border-t py-3" style={{ borderColor: "#F2EDE5" }}><div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#F2EDE5] font-semibold" style={{ color: "#8B7355" }}>{s.name?.slice(0, 1).toUpperCase() || "S"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" style={{ color: "#2C1810" }}>{s.name}</p><p className="truncate text-xs" style={{ color: "#8B7355" }}>{s.city || "Location not supplied"}</p></div><button onClick={() => setTab("salons")} className="rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "#F8F0E5", color: "#8D5C26" }}>Review</button></div>)}
              {!loading && pending === 0 && <p className="py-8 text-center text-sm" style={{ color: "#8B7355" }}>No salon registrations are awaiting review.</p>}
            </div>
            <div className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "#E8E0D5" }}>
              <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-semibold" style={{ color: "#2C1810" }}>This month’s commission</h2><p className="mt-1 text-xs" style={{ color: "#8B7355" }}>5% of booking value, excluding cancelled bookings.</p></div><button onClick={() => setTab("commissions")} className="text-xs font-semibold" style={{ color: "#B17D3D" }}>Details →</button></div>
              <p className="font-display text-3xl font-semibold" style={{ color: "#2C1810" }}>{commissionLoading ? "…" : money(commissionTotal)}</p>
              <p className="mt-2 text-xs leading-5" style={{ color: "#8B7355" }}>Calculated from {rows.reduce((sum, row) => sum + row.booking_count, 0)} uncancelled booking(s), with a total listed service value of {money(bookingTotal)}.</p>
            </div>
          </section>
        )}

        {tab === "salons" && (
          <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E8E0D5" }}>
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" style={{ borderColor: "#E8E0D5" }}>
              <div><h2 className="font-semibold" style={{ color: "#2C1810" }}>Salon registrations</h2><p className="mt-1 text-xs" style={{ color: "#8B7355" }}>Only approved, active salons appear in public search. Removed listings keep their booking history.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Search salons" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, city, email" className="min-w-0 rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#C4955A] sm:w-56" style={{ borderColor: "#E8E0D5" }} /><select aria-label="Filter by salon status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "#E8E0D5", color: "#5C3A21" }}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Not approved</option><option value="inactive">Removed from site</option><option value="all">All statuses</option></select></div>
            </div>
            {loading ? <p className="p-10 text-center text-sm" style={{ color: "#8B7355" }}>Loading salon applications…</p> : filteredSalons.length === 0 ? <p className="p-10 text-center text-sm" style={{ color: "#8B7355" }}>No salons match this filter.</p> : <div className="divide-y" style={{ borderColor: "#F2EDE5" }}>
              {filteredSalons.map(salon => <article key={salon.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {salon.logo_url ? <img src={salon.logo_url} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl border object-cover" style={{ borderColor: "#E8E0D5" }} /> : <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-[#F2EDE5] font-semibold" style={{ color: "#8B7355" }}>{salon.name?.slice(0, 1).toUpperCase() || "S"}</div>}
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold" style={{ color: "#2C1810" }}>{salon.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${salon.is_active === false ? "bg-gray-100 text-gray-700" : salon.approval_status === "approved" ? "bg-green-50 text-green-700" : salon.approval_status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{salon.is_active === false ? "Removed from site" : salon.approval_status === "rejected" ? "Not approved" : salon.approval_status}</span></div><p className="mt-1 truncate text-xs" style={{ color: "#8B7355" }}>{salon.city || "Location not supplied"} · {salon.email || "No business email"}</p><p className="mt-1 truncate text-xs" style={{ color: "#A48B71" }}>{salon.phone || "No phone supplied"}{salon.hours ? ` · ${salon.hours}` : ""}</p>{salon.about && <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: "#725333" }}>{salon.about}</p>}{Array.isArray(salon.services) && salon.services.length > 0 && <p className="mt-1 text-[11px]" style={{ color: "#8B7355" }}>Services: {salon.services.map(service => service.name).filter(Boolean).slice(0, 5).join(", ")}</p>}</div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                  {salon.approval_status === "pending" && <><button disabled={busyId === salon.id} onClick={() => void decide(salon, "rejected")} className="flex-1 rounded-xl border px-4 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50 sm:flex-none" style={{ borderColor: "#FECACA", background: "#FFF7F7" }}>Reject</button><button disabled={busyId === salon.id} onClick={() => void decide(salon, "approved")} className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:flex-none" style={{ background: "#2C1810" }}>{busyId === salon.id ? "Saving…" : "Approve salon"}</button></>}
                  <button disabled={busyId === salon.id} onClick={() => void changeSalonListing(salon, salon.is_active === false)} className="rounded-xl border px-4 py-2.5 text-xs font-semibold disabled:opacity-50" style={{ borderColor: salon.is_active === false ? "#B7D7C9" : "#FECACA", color: salon.is_active === false ? "#226144" : "#B42318", background: salon.is_active === false ? "#F3FBF6" : "#FFF7F7" }}>{busyId === salon.id ? "Saving…" : salon.is_active === false ? "Restore listing" : "Remove from site"}</button>
                </div>
              </article>)}
            </div>}
          </section>
        )}

        {tab === "commissions" && (
          <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E8E0D5" }}>
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" style={{ borderColor: "#E8E0D5" }}><div><h2 className="font-semibold" style={{ color: "#2C1810" }}>Monthly commission summary</h2><p className="mt-1 max-w-2xl text-xs leading-5" style={{ color: "#8B7355" }}>Commission due is 5% of the service value of bookings created in the selected month. Cancelled bookings are excluded.</p></div><label className="text-xs font-semibold" style={{ color: "#8B7355" }}>Month <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="ml-2 rounded-lg border px-3 py-2 text-sm font-normal text-[#2C1810]" style={{ borderColor: "#E8E0D5" }} /></label></div>
            <div className="grid gap-3 border-b p-4 sm:grid-cols-3 sm:p-5" style={{ borderColor: "#F2EDE5" }}><div><p className="text-xs" style={{ color: "#8B7355" }}>Booking value</p><p className="mt-1 text-lg font-semibold" style={{ color: "#2C1810" }}>{money(bookingTotal)}</p></div><div><p className="text-xs" style={{ color: "#8B7355" }}>Commission rate</p><p className="mt-1 text-lg font-semibold" style={{ color: "#2C1810" }}>5%</p></div><div><p className="text-xs" style={{ color: "#8B7355" }}>Commission due</p><p className="mt-1 text-lg font-semibold" style={{ color: "#B17D3D" }}>{commissionLoading ? "…" : money(commissionTotal)}</p></div></div>
            {commissionLoading ? <p className="p-8 text-center text-sm" style={{ color: "#8B7355" }}>Calculating monthly totals…</p> : rows.length === 0 ? <p className="p-8 text-center text-sm" style={{ color: "#8B7355" }}>No salons or bookings found for this month.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#FAF7F2] text-xs" style={{ color: "#8B7355" }}><tr><th className="px-5 py-3 font-semibold">Salon</th><th className="px-5 py-3 font-semibold">Uncancelled bookings</th><th className="px-5 py-3 font-semibold">Booking value</th><th className="px-5 py-3 font-semibold">5% commission</th></tr></thead><tbody>{rows.map(row => <tr key={row.salon_id} className="border-t" style={{ borderColor: "#F2EDE5" }}><td className="px-5 py-4 font-semibold" style={{ color: "#2C1810" }}>{row.salon_name}</td><td className="px-5 py-4" style={{ color: "#5C3A21" }}>{row.booking_count}</td><td className="px-5 py-4" style={{ color: "#5C3A21" }}>{money(row.booking_total)}</td><td className="px-5 py-4 font-semibold" style={{ color: "#B17D3D" }}>{money(row.commission_due)}</td></tr>)}</tbody></table></div>}
            <p className="border-t px-5 py-4 text-xs leading-5" style={{ borderColor: "#F2EDE5", color: "#8B7355" }}>This report calculates the amount due. Automatic collection or transfer requires a connected payment provider and is not performed by this report.</p>
          </section>
        )}
      </div>
    </main>
  );
}

export { AdminDashboardPage, AdminLoginPage };
