import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type View =
  | "home" | "find-salon" | "services" | "salon-detail"
  | "booking" | "booking-sent"
  | "my-appointments" | "appointment-detail"
  | "notifications" | "client-dashboard" | "client-profile"
  | "reviews"
  | "salon-login" | "salon-dashboard" | "appointment-requests"
  | "salon-calendar" | "manage-services" | "salon-profile";

type ApptStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed";

interface Appt {
  id: string;
  salon: string;
  salonImg: string;
  service: string;
  date: string;
  time: string;
  price: number;
  duration: string;
  status: ApptStatus;
  bookedOn: string;
}

/* ══════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════ */
const SALONS = [
  {
    id: "1", name: "Glam Studio", city: "Accra, Ghana", dist: "0.4 km",
    rating: 4.9, reviews: 312, hours: "9:00 AM – 7:00 PM",
    price: "from GH₵ 80",
    tags: ["Braiding", "Weaving", "Natural Hair"],
    img:   "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&h=400&fit=crop&auto=format",
    cover: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1400&h=520&fit=crop&auto=format",
    about: "Glam Studio is Accra's premier destination for African hair artistry. Our master stylists specialise in traditional and contemporary braiding, weaving, and natural hair care — blending heritage craft with modern elegance since 2014.",
    phone: "+233 20 123 4567",
    email: "hello@glamstudio.gh",
  },
  {
    id: "2", name: "Natural Roots", city: "Lagos, Nigeria", dist: "1.2 km",
    rating: 4.7, reviews: 198, hours: "8:00 AM – 6:00 PM",
    price: "from GH₵ 60",
    tags: ["Cornrows", "Dreadlocks", "Hair Treatment"],
    img:   "https://images.unsplash.com/photo-1626383137804-ff908d2753a2?w=600&h=400&fit=crop&auto=format",
    cover: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=1400&h=520&fit=crop&auto=format",
    about: "Natural Roots celebrates the beauty of African hair in its most authentic form. We are specialists in locs, cornrows, and protective styles rooted in tradition.",
    phone: "+234 80 234 5678",
    email: "info@naturalroots.ng",
  },
  {
    id: "3", name: "Afro Luxe", city: "Nairobi, Kenya", dist: "2.0 km",
    rating: 4.8, reviews: 254, hours: "10:00 AM – 8:00 PM",
    price: "from GH₵ 100",
    tags: ["Styling", "Braiding", "Hair Cutting"],
    img:   "https://images.unsplash.com/photo-1706629504952-ab5e50f5c179?w=600&h=400&fit=crop&auto=format",
    cover: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1400&h=520&fit=crop&auto=format",
    about: "Afro Luxe blends modern technique with traditional African styling to create looks that are bold, beautiful, and uniquely yours.",
    phone: "+254 71 345 6789",
    email: "luxe@afroluxe.ke",
  },
  {
    id: "4", name: "Crown & Glory", city: "Abuja, Nigeria", dist: "3.1 km",
    rating: 4.6, reviews: 167, hours: "9:00 AM – 6:00 PM",
    price: "from GH₵ 75",
    tags: ["Natural Hair", "Hair Treatment", "Weaving"],
    img:   "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&h=400&fit=crop&auto=format",
    cover: "https://images.unsplash.com/photo-1626383137804-ff908d2753a2?w=1400&h=520&fit=crop&auto=format",
    about: "Crown & Glory is dedicated to nourishing and celebrating natural African hair with personalised care plans and premium products.",
    phone: "+234 90 456 7890",
    email: "crown@crownandglory.ng",
  },
];

const SERVICES_LIST = [
  { id: "s1", name: "Box Braids",    desc: "Classic protective style with individual braids",     dur: "3–4 hrs", price: 150,
    img: "https://images.unsplash.com/photo-1572955304332-bf714bd49add?w=500&h=380&fit=crop&auto=format" },
  { id: "s2", name: "Cornrows",      desc: "Traditional African braiding close to the scalp",     dur: "1–2 hrs", price: 80,
    img: "https://images.unsplash.com/photo-1673470907547-1c0c6a996095?w=500&h=380&fit=crop&auto=format" },
  { id: "s3", name: "Weaving",       desc: "Sew-in or glue-in extensions for length and volume",  dur: "2–3 hrs", price: 200,
    img: "https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?w=500&h=380&fit=crop&auto=format" },
  { id: "s4", name: "Dreadlocks",    desc: "Loc installation, maintenance and retightening",       dur: "2–5 hrs", price: 180,
    img: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=500&h=380&fit=crop&auto=format" },
  { id: "s5", name: "Natural Hair",  desc: "Deep conditioning, twist-outs and moisture care",      dur: "1–2 hrs", price: 90,
    img: "https://images.unsplash.com/photo-1616166183781-0fdd2ef83374?w=500&h=380&fit=crop&auto=format" },
  { id: "s6", name: "Styling",       desc: "Blowouts, updos and special-occasion looks",           dur: "1 hr",    price: 110,
    img: "https://images.unsplash.com/photo-1606415918835-88d0614e75ad?w=500&h=380&fit=crop&auto=format" },
  { id: "s7", name: "Hair Cutting",  desc: "Precision cut and shape for all hair types",           dur: "45 min",  price: 60,
    img: "https://images.unsplash.com/photo-1643956740911-62c19a5405f0?w=500&h=380&fit=crop&auto=format" },
  { id: "s8", name: "Hair Treatment",desc: "Deep conditioning, protein and scalp care",            dur: "1 hr",    price: 75,
    img: "https://images.unsplash.com/photo-1636302925868-52075f44d810?w=500&h=380&fit=crop&auto=format" },
];

const TIME_SLOTS = [
  { t: "09:00 AM", booked: false }, { t: "09:30 AM", booked: false },
  { t: "10:00 AM", booked: true  }, { t: "10:30 AM", booked: true  },
  { t: "11:00 AM", booked: false }, { t: "11:30 AM", booked: false },
  { t: "12:00 PM", booked: false }, { t: "12:30 PM", booked: true  },
  { t: "01:00 PM", booked: false }, { t: "01:30 PM", booked: false },
  { t: "02:00 PM", booked: true  }, { t: "02:30 PM", booked: false },
  { t: "03:00 PM", booked: false }, { t: "03:30 PM", booked: true  },
  { t: "04:00 PM", booked: false }, { t: "04:30 PM", booked: false },
];

const APPTS_INIT: Appt[] = [
  { id: "a1", salon: "Glam Studio",   salonImg: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=200&h=200&fit=crop&auto=format", service: "Box Braids",   date: "Sat, Sep 13, 2026", time: "11:00 AM", price: 150, duration: "3–4 hrs", status: "approved",  bookedOn: "Sep 5, 2026" },
  { id: "a2", salon: "Natural Roots", salonImg: "https://images.unsplash.com/photo-1626383137804-ff908d2753a2?w=200&h=200&fit=crop&auto=format", service: "Cornrows",     date: "Tue, Sep 16, 2026", time: "09:00 AM", price: 80,  duration: "1–2 hrs", status: "pending",   bookedOn: "Sep 5, 2026" },
  { id: "a3", salon: "Afro Luxe",     salonImg: "https://images.unsplash.com/photo-1706629504952-ab5e50f5c179?w=200&h=200&fit=crop&auto=format", service: "Weaving",       date: "Fri, Aug 29, 2026", time: "10:00 AM", price: 200, duration: "2–3 hrs", status: "completed", bookedOn: "Aug 22, 2026" },
  { id: "a4", salon: "Crown & Glory", salonImg: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=200&h=200&fit=crop&auto=format", service: "Hair Treatment",date: "Mon, Aug 18, 2026", time: "02:00 PM", price: 90,  duration: "1 hr",    status: "cancelled", bookedOn: "Aug 14, 2026" },
  { id: "a5", salon: "Glam Studio",   salonImg: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=200&h=200&fit=crop&auto=format", service: "Styling",       date: "Wed, Jul 23, 2026", time: "01:00 PM", price: 110, duration: "1 hr",    status: "rejected",  bookedOn: "Jul 18, 2026" },
];

const NOTIFS = [
  { id: "n1", type: "approved",  title: "Appointment Approved",      body: "Your appointment at Glam Studio has been approved for Saturday at 11:00 AM.",                              time: "2 hours ago",  read: false },
  { id: "n2", type: "request",   title: "New Booking Request",       body: "Amara Diallo has requested an appointment for Box Braids on Sep 16 at 09:00 AM.",                         time: "4 hours ago",  read: false },
  { id: "n3", type: "rejected",  title: "Appointment Not Available", body: "Unfortunately, Natural Roots could not accept your appointment at 02:00 PM on Sep 10.",                   time: "Yesterday",    read: true  },
  { id: "n4", type: "cancelled", title: "Appointment Cancelled",     body: "Your appointment at Crown & Glory on Aug 18 has been cancelled successfully.",                             time: "2 days ago",   read: true  },
  { id: "n5", type: "reminder",  title: "Tomorrow's Appointment",    body: "Reminder: Your Box Braids session at Glam Studio is tomorrow at 11:00 AM. Don't be late!",               time: "3 days ago",   read: true  },
  { id: "n6", type: "approved",  title: "Review Your Visit",         body: "How was your Weaving session at Afro Luxe on Aug 29? Leave a review to help others.",                     time: "1 week ago",   read: true  },
];

const REVIEWS = [
  { id: "r1", name: "Aisha Mensah",   init: "AM", salon: "Glam Studio",   stars: 5, date: "Sep 2, 2026",  text: "Booking my braids through StyleHub was so easy. I could see the available times before booking and didn't have to call the salon at all. My stylist was absolutely wonderful!" },
  { id: "r2", name: "Kofi Asante",    init: "KA", salon: "Natural Roots", stars: 5, date: "Aug 28, 2026", text: "I found Natural Roots through StyleHub and booked my locs retightening in under two minutes. The salon was exactly as described — clean, professional and welcoming." },
  { id: "r3", name: "Fatima Diallo",  init: "FD", salon: "Afro Luxe",     stars: 4, date: "Aug 20, 2026", text: "Great platform! I love seeing which time slots are already booked so I know exactly when to show up. The approval confirmation was very reassuring." },
  { id: "r4", name: "Nana Boateng",   init: "NB", salon: "Crown & Glory", stars: 5, date: "Aug 15, 2026", text: "StyleHub changed how I book my hair appointments. No more back-and-forth on WhatsApp. The appointment status feature is genius — I always know where things stand." },
  { id: "r5", name: "Yemi Okafor",    init: "YO", salon: "Glam Studio",   stars: 5, date: "Aug 10, 2026", text: "Absolutely love this app! The African hair salon options in my area are extensive and the booking flow is seamless. Five stars without hesitation." },
  { id: "r6", name: "Adwoa Sarpong",  init: "AS", salon: "Natural Roots", stars: 4, date: "Aug 5, 2026",  text: "Very reliable service. My stylist did an incredible job with my cornrows. I appreciated being notified when my appointment was approved." },
];

const SALON_REQUESTS = [
  { id: "r1", client: "Amara Diallo",  init: "AD", service: "Box Braids",    date: "Tue, Sep 16", time: "09:00 AM", dur: "3–4 hrs", price: 150, status: "pending"  as ApptStatus },
  { id: "r2", client: "Kofi Mensah",   init: "KM", service: "Cornrows",      date: "Tue, Sep 16", time: "01:00 PM", dur: "1–2 hrs", price: 80,  status: "pending"  as ApptStatus },
  { id: "r3", client: "Fatima Osei",   init: "FO", service: "Weaving",       date: "Wed, Sep 17", time: "11:00 AM", dur: "2–3 hrs", price: 200, status: "approved" as ApptStatus },
  { id: "r4", client: "Nana Asante",   init: "NA", service: "Hair Treatment", date: "Wed, Sep 17", time: "03:00 PM", dur: "1 hr",    price: 90,  status: "rejected" as ApptStatus },
  { id: "r5", client: "Abena Quartey", init: "AQ", service: "Dreadlocks",    date: "Thu, Sep 18", time: "10:00 AM", dur: "2–5 hrs", price: 180, status: "pending"  as ApptStatus },
];

/* ══════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════════════════════ */
const statusCfg: Record<ApptStatus, { label: string; dot: string; pill: string; text: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",  pill: "bg-amber-50  border border-amber-200", text: "text-amber-700"  },
  approved:  { label: "Approved",  dot: "bg-green-500",  pill: "bg-green-50  border border-green-200", text: "text-green-700"  },
  rejected:  { label: "Rejected",  dot: "bg-red-400",    pill: "bg-red-50    border border-red-200",   text: "text-red-700"    },
  cancelled: { label: "Cancelled", dot: "bg-gray-400",   pill: "bg-gray-100  border border-gray-200",  text: "text-gray-600"   },
  completed: { label: "Completed", dot: "bg-[#C47A5A]",  pill: "bg-[#FAF2EE] border border-[#EACDBE]", text: "text-[#8E4424]"   },
};

function Badge({ status }: { status: ApptStatus }) {
  const c = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.pill} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= n ? "#F59E0B" : "#E5E7EB"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

function Avi({ initials, size = "md", color }: { initials: string; size?: "xs"|"sm"|"md"|"lg"; color?: string }) {
  const sz = { xs:"w-6 h-6 text-[10px]", sm:"w-9 h-9 text-xs", md:"w-11 h-11 text-sm", lg:"w-16 h-16 text-xl" }[size];
  return (
    <div className={`${sz} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white select-none`}
      style={{ background: color || "linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
      {initials}
    </div>
  );
}

function Pill({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all ${active ? "text-white border-transparent" : "hover:bg-[#F2EDE5] border-[#E8E0D5]"}`}
      style={{ background: active ? "#2C1810" : "transparent", color: active ? "white" : "#8B7355" }}>
      {label}
    </button>
  );
}

function Btn({ children, variant = "primary", className = "", onClick }: {
  children: React.ReactNode; variant?: "primary"|"secondary"|"ghost"|"danger"|"gold";
  className?: string; onClick?: () => void;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[.97] rounded-2xl";
  const v = {
    primary:   "bg-[#2C1810] text-[#FAF7F2] hover:opacity-90",
    secondary: "bg-[#F2EDE5] text-[#2C1810] hover:bg-[#EDE8E0] border border-[#E8E0D5]",
    ghost:     "text-[#2C1810] hover:bg-[#F2EDE5]",
    danger:    "bg-[#FEF2F2] text-red-600 border border-red-200 hover:bg-red-50",
    gold:      "bg-[#C4955A] text-white hover:opacity-90",
  }[variant];
  return <button onClick={onClick} className={`${base} ${v} ${className}`}>{children}</button>;
}

function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C4955A" }}>{children}</p>;
}

function PageHeading({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="font-display text-4xl font-semibold mt-1.5" style={{ color: "#2C1810" }}>{title}</h1>
      {sub && <p className="text-sm mt-1.5" style={{ color: "#8B7355" }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════ */
const NAV_LINKS: { label: string; view: View }[] = [
  { label: "Home",           view: "home"           },
  { label: "Find a Salon",   view: "find-salon"     },
  { label: "Services",       view: "services"       },
  { label: "My Appointments",view: "my-appointments"},
  { label: "Reviews",        view: "reviews"        },
];

function Nav({ current, go, unread }: { current: View; go: (v: View) => void; unread: number }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 glass border-b" style={{ borderColor: "#E8E0D5" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => go("home")} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
              <path d="M9 16.5c.85.63 1.88 1 3 1s2.15-.37 3-1"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-[1.15rem] tracking-tight" style={{ color: "#2C1810" }}>StyleHub</span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map(l => (
            <button key={l.view} onClick={() => go(l.view)}
              className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${current === l.view ? "bg-[#F2EDE5] text-[#2C1810]" : "text-[#8B7355] hover:text-[#2C1810] hover:bg-[#F2EDE5]"}`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => go("notifications")} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F2EDE5] transition-colors">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5C3A21" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: "#C47A5A" }}>{unread}</span>
            )}
          </button>

          <button onClick={() => go("client-profile")} className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity ring-2 ring-[#E8E0D5]"
            style={{ background: "linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">ZA</div>
          </button>

          <Btn variant="primary" className="hidden md:flex px-5 py-2 text-[13px]" onClick={() => go("find-salon")}>
            Book Appointment
          </Btn>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F2EDE5] transition-colors">
            {open
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t px-4 py-3 space-y-1 anim-down" style={{ borderColor: "#E8E0D5", background: "#FAF7F2" }}>
          {NAV_LINKS.map(l => (
            <button key={l.view} onClick={() => { go(l.view); setOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${current === l.view ? "bg-[#F2EDE5] text-[#2C1810]" : "text-[#8B7355] hover:bg-[#F2EDE5]"}`}>
              {l.label}
            </button>
          ))}
          <Btn variant="primary" className="w-full py-3 mt-2 text-sm" onClick={() => { go("find-salon"); setOpen(false); }}>
            Book Appointment
          </Btn>
        </div>
      )}
    </nav>
  );
}

/* ── Bottom mobile nav ────────────────────────────────── */
const MOB_NAV = [
  {
    view: "home" as View,
    label: "Home",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#2C1810" : "none"} stroke={active ? "#2C1810" : "#8B7355"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    view: "find-salon" as View,
    label: "Salons",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#2C1810" : "#8B7355"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    view: "my-appointments" as View,
    label: "Bookings",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#2C1810" : "#8B7355"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    view: "notifications" as View,
    label: "Alerts",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#2C1810" : "none"} stroke={active ? "#2C1810" : "#8B7355"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    view: "client-dashboard" as View,
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#2C1810" : "none"} stroke={active ? "#2C1810" : "#8B7355"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function MobileNav({ current, go }: { current: View; go: (v: View) => void }) {
  return (
    <div className="fixed bottom-0 inset-x-0 lg:hidden z-50 glass border-t" style={{ borderColor: "#E8E0D5" }}>
      <div className="flex items-center justify-around pb-safe py-2">
        {MOB_NAV.map(({ view, icon, label }) => {
          const active = current === view;
          return (
            <button key={view} onClick={() => go(view)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${active ? "bg-[#F2EDE5]" : ""}`}>
              <span className="flex items-center justify-center w-5 h-5">{icon(active)}</span>
              <span className={`text-[10px] font-semibold ${active ? "text-[#2C1810]" : "text-[#8B7355]"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
function Footer({ go }: { go: (v: View) => void }) {
  return (
    <footer style={{ background: "#1C0E08" }} className="mt-24">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#C4955A 0%,#7A5029 100%)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
                  <path d="M9 16.5c.85.63 1.88 1 3 1s2.15-.37 3-1"/>
                </svg>
              </div>
              <span className="font-display font-semibold text-lg text-white">StyleHub</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#8A7060" }}>
              Making hair appointments simple, convenient and stress-free for clients and salons across Africa.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5 mt-6">
              {["IG", "TW", "FB"].map(s => (
                <div key={s} className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ background: "#2C1810", color: "#C4955A" }}>{s}</div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#C4955A" }}>Platform</p>
            <ul className="space-y-2.5">
              {(["home","find-salon","services","my-appointments","reviews"] as View[]).map(v => (
                <li key={v}><button onClick={() => go(v)} className="text-sm hover:text-white transition-colors capitalize" style={{ color: "#7A6050" }}>
                  {v.replace(/-/g, " ")}
                </button></li>
              ))}
            </ul>
          </div>

          {/* For Salons */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#C4955A" }}>For Salons</p>
            <ul className="space-y-2.5">
              {(["salon-login","salon-dashboard","appointment-requests","manage-services","salon-profile"] as View[]).map((v,i) => (
                <li key={v}><button onClick={() => go(v)} className="text-sm hover:text-white transition-colors" style={{ color: "#7A6050" }}>
                  {["Join StyleHub","Salon Dashboard","Appointment Requests","Manage Services","Salon Profile"][i]}
                </button></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "#2C1810" }}>
          <p className="text-xs" style={{ color: "#4A3028" }}>© 2026 StyleHub. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy","Terms of Service","Cookie Policy"].map(t => (
              <span key={t} className="text-xs cursor-pointer hover:text-white transition-colors" style={{ color: "#4A3028" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════ */
function HomePage({ go }: { go: (v: View) => void }) {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1572955304332-bf714bd49add?w=1800&h=1100&fit=crop&auto=format"
          alt="African hair fashion" className="absolute inset-0 w-full h-full object-cover object-center" />
        {/* layered overlays for depth */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(110deg,rgba(28,14,8,0.93) 0%,rgba(28,14,8,0.65) 55%,rgba(28,14,8,0.15) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 50%,transparent 40%,rgba(28,14,8,0.4) 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-xl anim-up">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold mb-7 border"
              style={{ background: "rgba(196,149,90,0.15)", color: "#C4955A", borderColor: "rgba(196,149,90,0.3)" }}>
              ✦ Africa's Premier Hair Booking Platform
            </span>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-semibold text-white leading-[1.02] mb-6 tracking-tight">
              Your Style.<br/>
              <em className="not-italic" style={{ color: "#C4955A" }}>Your Time.</em><br/>
              Your Salon.
            </h1>

            <p className="text-[1.05rem] leading-relaxed mb-10 max-w-md" style={{ color: "rgba(255,255,255,0.72)" }}>
              Discover your favourite hairstyles, find trusted hair shops, and book your appointment without the back-and-forth.
            </p>

            <div className="flex flex-wrap gap-3">
              <Btn variant="gold" className="px-8 py-4 text-[15px]" onClick={() => go("find-salon")}>Find a Salon</Btn>
              <button onClick={() => go("services")} className="px-8 py-4 rounded-2xl text-[15px] font-semibold transition-all hover:bg-white/15 border" style={{ color: "white", borderColor: "rgba(255,255,255,0.28)" }}>
                Explore Services
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-10 mt-14 pt-14 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              {[["500+","Hair Salons"],["12K+","Happy Clients"],["4.8 ★","Avg Rating"]].map(([n,l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-semibold text-white">{n}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating portrait card */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:block anim-up" style={{ animationDelay: "0.15s" }}>
          <div className="w-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?w=500&h=640&fit=crop&auto=format"
              alt="Hair style" className="w-full h-96 object-cover" />
            <div className="p-4" style={{ background: "rgba(28,14,8,0.85)", backdropFilter: "blur(8px)" }}>
              <p className="font-display text-white text-lg font-semibold">Afro Natural</p>
              <div className="flex items-center justify-between mt-1">
                <Stars n={5} size={12} />
                <span className="text-xs" style={{ color: "#C4955A" }}>from GH₵ 90</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Widget ─────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 -mt-10">
        <div className="rounded-3xl p-6 sm:p-8 shadow-2xl border" style={{ background: "white", borderColor: "#E8E0D5" }}>
          <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: "#2C1810" }}>Find Your Perfect Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { emoji: "📍", label: "Location",      placeholder: "e.g. Accra, Ghana"       },
              { emoji: "✂️",  label: "Hair Service",  placeholder: "Braiding, Cornrows…"    },
              { emoji: "📅", label: "Preferred Date", placeholder: "Pick a date"            },
            ].map(({ emoji, label, placeholder }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#8B7355" }}>{label}</label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-colors focus-within:border-[#C4955A]" style={{ borderColor: "#E8E0D5", background: "#FAF7F2" }}>
                  <span>{emoji}</span>
                  <input placeholder={placeholder} className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#2C1810" }} />
                </div>
              </div>
            ))}
          </div>
          <Btn variant="primary" className="w-full py-3.5 text-sm" onClick={() => go("find-salon")}>Search Salons</Btn>
        </div>
      </section>

      {/* ── Popular Services ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel>Our Services</SectionLabel>
            <h2 className="font-display text-4xl font-semibold mt-2" style={{ color: "#2C1810" }}>Popular Hair Services</h2>
          </div>
          <button onClick={() => go("services")} className="hidden sm:block text-sm font-semibold transition-all hover:gap-3" style={{ color: "#C4955A" }}>View All Services →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES_LIST.map(s => (
            <button key={s.id} onClick={() => go("find-salon")} className="group text-left rounded-2xl overflow-hidden border card-hover" style={{ background: "white", borderColor: "#E8E0D5" }}>
              <div className="relative h-44 bg-amber-50 overflow-hidden">
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(28,14,8,0.65) 0%,transparent 55%)" }} />
                <h3 className="absolute bottom-3 left-3.5 font-display text-white font-semibold text-[1rem]">{s.name}</h3>
              </div>
              <div className="p-4">
                <p className="text-xs leading-relaxed mb-3" style={{ color: "#8B7355" }}>{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: "#C4955A" }}>from GH₵ {s.price}</span>
                  <span className="text-xs font-semibold" style={{ color: "#2C1810" }}>View →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Salons ───────────────────────────────── */}
      <section className="py-16 mt-6" style={{ background: "#F2EDE5" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel>Featured Salons</SectionLabel>
              <h2 className="font-display text-4xl font-semibold mt-2" style={{ color: "#2C1810" }}>Top Rated Near You</h2>
            </div>
            <button onClick={() => go("find-salon")} className="hidden sm:block text-sm font-semibold" style={{ color: "#C4955A" }}>Find More →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SALONS.map(s => <SalonCard key={s.id} salon={s} go={go} />)}
          </div>
        </div>
      </section>

      {/* ── Reviews snippet ───────────────────────────────── */}
      <ReviewsSection />

      {/* ── CTA Banner ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="relative rounded-3xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1572954889228-2b12a55144d1?w=1400&h=420&fit=crop&auto=format"
            alt="Book now" className="w-full h-64 object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: "rgba(28,14,8,0.72)" }}>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-3">Ready for Your Next Look?</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.70)" }}>Join thousands of clients who've ditched the WhatsApp back-and-forth.</p>
            <Btn variant="gold" className="px-8 py-3.5 text-sm" onClick={() => go("find-salon")}>Find a Salon Now</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Salon Card (reused) ─────────────────────────────── */
function SalonCard({ salon, go }: { salon: typeof SALONS[0]; go: (v: View) => void }) {
  return (
    <div className="rounded-2xl overflow-hidden border card-hover cursor-pointer group" style={{ background: "white", borderColor: "#E8E0D5" }}>
      <div className="relative h-48 bg-amber-50 overflow-hidden">
        <img src={salon.img} alt={salon.name} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "rgba(28,14,8,0.72)", backdropFilter: "blur(4px)" }}>★ {salon.rating}</div>
        <div className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(196,149,90,0.92)", color: "white" }}>{salon.price}</div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-0.5" style={{ color: "#2C1810" }}>{salon.name}</h3>
        <p className="text-xs mb-1" style={{ color: "#8B7355" }}>📍 {salon.city} · {salon.dist}</p>
        <p className="text-xs mb-2.5" style={{ color: "#8B7355" }}>🕐 {salon.hours}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {salon.tags.slice(0,2).map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: "#F2EDE5", color: "#8B7355" }}>{t}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" className="flex-1 py-2 text-xs" onClick={() => go("salon-detail")}>View</Btn>
          <Btn variant="primary"   className="flex-1 py-2 text-xs" onClick={() => go("booking")}>Book</Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FIND A SALON
══════════════════════════════════════════════════════════ */
function FindSalonPage({ go }: { go: (v: View) => void }) {
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState("all");
  const [rat, setRat] = useState("all");

  const filtered = SALONS.filter(s => {
    const qs = q.toLowerCase();
    if (q && !s.name.toLowerCase().includes(qs) && !s.city.toLowerCase().includes(qs)) return false;
    if (svc !== "all" && !s.tags.some(t => t.toLowerCase().includes(svc.toLowerCase()))) return false;
    if (rat !== "all" && s.rating < Number(rat)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeading label="Discover" title="Find a Salon" sub="Browse top-rated hair salons and book your appointment instantly." />

      {/* Search row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl border" style={{ background: "white", borderColor: "#E8E0D5" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search salon or location…" className="flex-1 text-sm bg-transparent outline-none" />
        </div>
        <select value={svc} onChange={e => setSvc(e.target.value)} className="px-4 py-3 rounded-xl border text-sm outline-none" style={{ background: "white", borderColor: "#E8E0D5", color: "#2C1810" }}>
          <option value="all">All Services</option>
          {["Braiding","Cornrows","Dreadlocks","Weaving","Natural Hair","Styling","Hair Treatment","Hair Cutting"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={rat} onChange={e => setRat(e.target.value)} className="px-4 py-3 rounded-xl border text-sm outline-none" style={{ background: "white", borderColor: "#E8E0D5", color: "#2C1810" }}>
          <option value="all">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.7">4.7+ Stars</option>
          <option value="4.9">4.9 Stars</option>
        </select>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["Available Today","Within 2 km","Top Rated","Budget-friendly","Open Now"].map(f => <Pill key={f} label={f} />)}
      </div>

      <p className="text-xs font-semibold mb-6" style={{ color: "#8B7355" }}>{filtered.length} salon{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(s => <SalonCard key={s.id} salon={s} go={go} />)}
        {filtered.length === 0 && (
          <div className="col-span-4 py-20 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: "#8B7355" }}>No salons match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICES PAGE
══════════════════════════════════════════════════════════ */
function ServicesPage({ go }: { go: (v: View) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <SectionLabel>What We Offer</SectionLabel>
        <h1 className="font-display text-5xl font-semibold mt-2 mb-3" style={{ color: "#2C1810" }}>Hair Services</h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "#8B7355" }}>Find the perfect service and book your appointment in seconds.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SERVICES_LIST.map(s => (
          <div key={s.id} className="group rounded-2xl overflow-hidden border card-hover" style={{ background: "white", borderColor: "#E8E0D5" }}>
            <div className="relative h-52 bg-amber-50 overflow-hidden">
              <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(28,14,8,0.62) 0%,transparent 55%)" }} />
              <h3 className="absolute bottom-4 left-4 font-display text-white text-xl font-semibold">{s.name}</h3>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#8B7355" }}>{s.desc}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm" style={{ color: "#C4955A" }}>from GH₵ {s.price}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#F2EDE5", color: "#8B7355" }}>{s.dur}</span>
              </div>
              <Btn variant="primary" className="w-full py-2.5 text-sm" onClick={() => go("find-salon")}>View Shops</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SALON DETAIL
══════════════════════════════════════════════════════════ */
function SalonDetailPage({ go }: { go: (v: View) => void }) {
  const s = SALONS[0];
  const [tab, setTab] = useState<"services"|"reviews">("services");

  return (
    <div>
      {/* Cover */}
      <div className="relative h-64 sm:h-80 bg-amber-100 overflow-hidden">
        <img src={s.cover} alt={s.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(28,14,8,0.55) 0%,transparent 60%)" }} />
        <button onClick={() => go("find-salon")} className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border glass" style={{ color: "#2C1810" }}>
          ← Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header card */}
        <div className="flex flex-col sm:flex-row gap-5 -mt-14 mb-10 relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-white bg-amber-50">
            <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
          </div>
          <div className="pt-2 sm:pt-16 flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: "#2C1810" }}>{s.name}</h1>
              <p className="text-sm mt-1" style={{ color: "#8B7355" }}>📍 {s.city} · {s.dist}</p>
              <div className="flex items-center gap-2.5 mt-2">
                <Stars n={5} />
                <span className="font-semibold text-sm">{s.rating}</span>
                <span className="text-sm" style={{ color: "#8B7355" }}>({s.reviews} reviews)</span>
              </div>
            </div>
            <Btn variant="primary" className="flex-shrink-0 px-8 py-3.5 text-sm" onClick={() => go("booking")}>Book Appointment</Btn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
          {/* Main */}
          <div className="lg:col-span-2">
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#8B7355" }}>{s.about}</p>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl mb-8 w-fit" style={{ background: "#F2EDE5" }}>
              {(["services","reviews"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${tab===t?"text-[#2C1810] shadow-sm":"text-[#8B7355] hover:text-[#2C1810]"}`}
                  style={{ background: tab===t ? "white" : "transparent" }}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "services" && (
              <div className="space-y-3">
                {SERVICES_LIST.map(sv => (
                  <div key={sv.id} className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: "white", borderColor: "#E8E0D5" }}>
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm" style={{ color: "#2C1810" }}>{sv.name}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#F2EDE5", color: "#8B7355" }}>{sv.dur}</span>
                      </div>
                      <p className="text-xs" style={{ color: "#8B7355" }}>{sv.desc}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold text-sm" style={{ color: "#C4955A" }}>GH₵ {sv.price}</span>
                      <Btn variant="primary" className="px-4 py-2 text-xs" onClick={() => go("booking")}>Select</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-4">
                {REVIEWS.slice(0,4).map(r => (
                  <div key={r.id} className="p-5 rounded-2xl border" style={{ background: "white", borderColor: "#E8E0D5" }}>
                    <div className="flex items-start gap-3">
                      <Avi initials={r.init} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm" style={{ color: "#2C1810" }}>{r.name}</span>
                          <span className="text-xs" style={{ color: "#8B7355" }}>{r.date}</span>
                        </div>
                        <Stars n={r.stars} size={12} />
                        <p className="text-xs leading-relaxed mt-2" style={{ color: "#8B7355" }}>{r.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5 border sticky top-24" style={{ background: "white", borderColor: "#E8E0D5" }}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: "#2C1810" }}>Salon Info</h3>
              {[
                { icon: "🕐", label: "Hours",   val: s.hours   },
                { icon: "📍", label: "Location", val: s.city    },
                { icon: "📞", label: "Phone",    val: s.phone   },
                { icon: "✉️",  label: "Email",   val: s.email   },
              ].map(({ icon, label, val }) => (
                <div key={label} className="py-3 border-b last:border-0" style={{ borderColor: "#E8E0D5" }}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{icon}</span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8B7355" }}>{label}</p>
                      <p className="text-sm" style={{ color: "#2C1810" }}>{val}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Btn variant="primary" className="w-full py-3.5 text-sm mt-5" onClick={() => go("booking")}>Book Appointment</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BOOKING FLOW (4 steps)
══════════════════════════════════════════════════════════ */
function BookingPage({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState(1);
  const [selSvc, setSelSvc] = useState<typeof SERVICES_LIST[0] | null>(null);
  const [selDate, setSelDate] = useState<number | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);

  const STEPS = ["Select Service","Select Date","Select Time","Confirm"];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={() => go("salon-detail")} className="flex items-center gap-1.5 text-sm mb-8 hover:opacity-60 transition-opacity" style={{ color: "#8B7355" }}>
        ← Glam Studio
      </button>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step, active = n === step;
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${active?"border-[#2C1810] bg-[#2C1810] text-white":done?"border-[#C4955A] bg-[#C4955A] text-white":"border-[#E8E0D5] text-[#8B7355]"}`}>
                  {done ? "✓" : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${active?"text-[#2C1810]":"text-[#8B7355]"}`}>{label}</span>
              </div>
              {n < 4 && <div className={`h-px mx-3 flex-1 w-8 sm:w-16 ${n < step?"bg-[#C4955A]":"bg-[#E8E0D5]"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="anim-up">
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "#2C1810" }}>Select a Service</h1>
          <p className="text-sm mb-7" style={{ color: "#8B7355" }}>Choose the service you'd like to book at Glam Studio.</p>
          <div className="space-y-3">
            {SERVICES_LIST.map(sv => {
              const sel = selSvc?.id === sv.id;
              return (
                <button key={sv.id} onClick={() => setSelSvc(sv)}
                  className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-all ${sel?"border-[#C4955A]":"border-[#E8E0D5] hover:border-[#C4955A]/40"}`}
                  style={{ background: sel ? "#FFF8EE" : "white" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: "#2C1810" }}>{sv.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#F2EDE5", color: "#8B7355" }}>{sv.dur}</span>
                    </div>
                    <p className="text-xs" style={{ color: "#8B7355" }}>{sv.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color: "#C4955A" }}>GH₵ {sv.price}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sel ? "border-[#C4955A]" : "border-[#E8E0D5]"}`}>
                      {sel && <div className="w-2.5 h-2.5 rounded-full bg-[#C4955A]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Btn variant="primary" className="w-full py-4 text-sm mt-8" onClick={() => selSvc && setStep(2)} >
            Continue → Select Date
          </Btn>
        </div>
      )}

      {/* Step 2: Calendar */}
      {step === 2 && (
        <div className="anim-up">
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "#2C1810" }}>Select a Date</h1>
          <p className="text-sm mb-7" style={{ color: "#8B7355" }}>Choose your preferred appointment date in September 2026.</p>
          <div className="rounded-3xl border p-6 mb-6" style={{ background: "white", borderColor: "#E8E0D5" }}>
            <div className="flex items-center justify-between mb-6">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F2EDE5] text-lg">‹</button>
              <span className="font-semibold" style={{ color: "#2C1810" }}>September 2026</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F2EDE5] text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 text-center mb-3">
              {["M","T","W","T","F","S","S"].map((d,i) => (
                <div key={i} className="text-[11px] font-semibold py-1" style={{ color: "#8B7355" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 text-center gap-y-1">
              {Array.from({length:30},(_,i)=>i+1).map(d => {
                const past = d < 6, sel = selDate === d;
                return (
                  <button key={d} disabled={past} onClick={() => setSelDate(d)}
                    className={`w-9 h-9 mx-auto rounded-xl text-sm font-medium transition-all flex items-center justify-center ${past?"opacity-30 cursor-not-allowed":sel?"text-white":"hover:bg-[#F2EDE5]"}`}
                    style={{ background: sel ? "#2C1810" : "transparent", color: sel ? "white" : "#2C1810" }}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          {selDate && (
            <div className="px-4 py-3 rounded-xl mb-4 text-sm font-medium" style={{ background: "#FFF8EE", color: "#8B6039" }}>
              📅 Selected: Monday, September {selDate}, 2026
            </div>
          )}
          <div className="flex gap-3">
            <Btn variant="secondary" className="px-6 py-4 text-sm" onClick={() => setStep(1)}>← Back</Btn>
            <Btn variant="primary" className="flex-1 py-4 text-sm" onClick={() => selDate && setStep(3)}>Continue → Select Time</Btn>
          </div>
        </div>
      )}

      {/* Step 3: Time Slots */}
      {step === 3 && (
        <div className="anim-up">
          <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: "#2C1810" }}>Select a Time</h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            {selDate ? `September ${selDate}, 2026` : "Choose an available time slot."}
          </p>

          {/* Legend */}
          <div className="flex items-center gap-6 px-4 py-3 rounded-2xl mb-6" style={{ background: "#F2EDE5" }}>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2C1810]" /><span className="text-xs font-medium" style={{ color: "#8B7355" }}>Available</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-300" /><span className="text-xs font-medium" style={{ color: "#8B7355" }}>Booked</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#C4955A]" /><span className="text-xs font-medium" style={{ color: "#8B7355" }}>Selected</span></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {TIME_SLOTS.map(({ t, booked }) => {
              const sel = selTime === t;
              return (
                <button key={t} disabled={booked} onClick={() => !booked && setSelTime(t)}
                  className={`relative py-3.5 px-4 rounded-2xl text-sm font-medium border transition-all ${booked ? "cursor-not-allowed" : sel ? "ring-2 ring-[#C4955A]" : "hover:scale-[1.02] active:scale-[.98]"}`}
                  style={{
                    background: booked ? "#FEF2F2" : sel ? "#2C1810" : "white",
                    color:      booked ? "#F87171" : sel ? "white"   : "#2C1810",
                    borderColor:booked ? "#FECACA" : sel ? "#2C1810" : "#E8E0D5",
                  }}>
                  {t}
                  {booked && <span className="absolute bottom-1 right-2 text-[10px] font-bold text-red-400">Booked</span>}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Btn variant="secondary" className="px-6 py-4 text-sm" onClick={() => setStep(2)}>← Back</Btn>
            <Btn variant="primary" className="flex-1 py-4 text-sm" onClick={() => selTime && setStep(4)}>Continue → Confirm</Btn>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="anim-up">
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "#2C1810" }}>Confirm Appointment</h1>
          <p className="text-sm mb-8" style={{ color: "#8B7355" }}>Review your booking details before submitting the request.</p>

          <div className="rounded-3xl border p-6 mb-5" style={{ background: "white", borderColor: "#E8E0D5" }}>
            <div className="flex items-center gap-4 pb-5 mb-5 border-b" style={{ borderColor: "#E8E0D5" }}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 flex-shrink-0">
                <img src={SALONS[0].img} alt="Glam Studio" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg" style={{ color: "#2C1810" }}>Glam Studio</h3>
                <p className="text-xs" style={{ color: "#8B7355" }}>📍 Accra, Ghana</p>
              </div>
            </div>

            {[
              { l: "Service",  v: selSvc?.name || "Box Braids" },
              { l: "Date",     v: selDate ? `September ${selDate}, 2026` : "Sep 13, 2026" },
              { l: "Time",     v: selTime || "11:00 AM" },
              { l: "Duration", v: selSvc?.dur || "3–4 hrs" },
              { l: "Price",    v: `GH₵ ${selSvc?.price || 150}` },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between items-center py-3.5 border-b last:border-0" style={{ borderColor: "#E8E0D5" }}>
                <span className="text-sm" style={{ color: "#8B7355" }}>{l}</span>
                <span className="text-sm font-semibold" style={{ color: l === "Price" ? "#C4955A" : "#2C1810" }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="px-4 py-3.5 rounded-2xl mb-6 text-xs leading-relaxed" style={{ background: "#FFF8EE", color: "#8B6039", border: "1px solid #F5E6C8" }}>
            ⚡ After you submit, Glam Studio will review your request and either approve or reject it. You'll receive a notification instantly.
          </div>

          <div className="flex gap-3">
            <Btn variant="secondary" className="px-6 py-4 text-sm" onClick={() => setStep(3)}>← Back</Btn>
            <Btn variant="gold" className="flex-1 py-4 text-sm" onClick={() => go("booking-sent")}>Request Appointment</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BOOKING SENT
══════════════════════════════════════════════════════════ */
function BookingSentPage({ go }: { go: (v: View) => void }) {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center anim-up">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1 className="font-display text-3xl font-semibold mb-3" style={{ color: "#2C1810" }}>Appointment Request Sent!</h1>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "#8B7355" }}>
        Glam Studio has received your request. They will review it and you'll be notified once it is approved or rejected.
      </p>

      <div className="rounded-3xl border p-5 mb-8 text-left" style={{ background: "white", borderColor: "#E8E0D5" }}>
        {[
          { l: "Salon",   v: "Glam Studio" },
          { l: "Service", v: "Box Braids" },
          { l: "Date",    v: "Saturday, Sep 13, 2026" },
          { l: "Time",    v: "11:00 AM" },
        ].map(({ l, v }) => (
          <div key={l} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: "#E8E0D5" }}>
            <span className="text-xs" style={{ color: "#8B7355" }}>{l}</span>
            <span className="text-sm font-semibold" style={{ color: "#2C1810" }}>{v}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-3">
          <span className="text-xs" style={{ color: "#8B7355" }}>Status</span>
          <Badge status="pending" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Btn variant="primary" className="w-full py-3.5 text-sm" onClick={() => go("my-appointments")}>View My Appointments</Btn>
        <Btn variant="secondary" className="w-full py-3.5 text-sm" onClick={() => go("home")}>Back to Home</Btn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MY APPOINTMENTS
══════════════════════════════════════════════════════════ */
function MyAppointmentsPage({ appts, setAppts, go, setDetail }: {
  appts: Appt[]; setAppts: (a: Appt[]) => void;
  go: (v: View) => void; setDetail: (a: Appt) => void;
}) {
  const [filter, setFilter] = useState<ApptStatus|"all">("all");
  const [cancelTarget, setCancelTarget] = useState<Appt|null>(null);
  const [cancelDone, setCancelDone] = useState(false);

  const visible = filter === "all" ? appts : appts.filter(a => a.status === filter);

  const doCancel = () => {
    if (!cancelTarget) return;
    setAppts(appts.map(a => a.id === cancelTarget.id ? { ...a, status: "cancelled" } : a));
    setCancelDone(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeading label="Your Bookings" title="My Appointments" />

      <div className="flex gap-2 flex-wrap mb-8">
        {(["all","pending","approved","completed","cancelled","rejected"] as const).map(f => (
          <Pill key={f} label={f === "all" ? "All" : f} active={filter===f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <div className="space-y-4">
        {visible.map(a => (
          <div key={a.id} className="rounded-2xl border overflow-hidden card-hover" style={{ background: "white", borderColor: "#E8E0D5" }}>
            <div className="flex gap-4 sm:gap-5 p-4 sm:p-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 flex-shrink-0">
                <img src={a.salonImg} alt={a.salon} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <h3 className="font-semibold" style={{ color: "#2C1810" }}>{a.salon}</h3>
                    <p className="text-sm" style={{ color: "#8B7355" }}>{a.service}</p>
                  </div>
                  <Badge status={a.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: "#8B7355" }}>
                  <span>📅 {a.date}</span>
                  <span>🕐 {a.time}</span>
                  <span>⏱ {a.duration}</span>
                  <span className="font-semibold" style={{ color: "#C4955A" }}>GH₵ {a.price}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Btn variant="secondary" className="px-4 py-1.5 text-xs" onClick={() => { setDetail(a); go("appointment-detail"); }}>
                    View Details
                  </Btn>
                  {a.status === "pending" && (
                    <Btn variant="danger" className="px-4 py-1.5 text-xs" onClick={() => { setCancelTarget(a); setCancelDone(false); }}>
                      Cancel Appointment
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm mb-4" style={{ color: "#8B7355" }}>No appointments found.</p>
            <Btn variant="primary" className="px-6 py-3 text-sm" onClick={() => go("find-salon")}>Book Now</Btn>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelTarget && !cancelDone && (
        <Modal>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#FEF2F2" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-center mb-2" style={{ color: "#2C1810" }}>Cancel this Appointment?</h2>
          <p className="text-sm text-center leading-relaxed mb-8" style={{ color: "#8B7355" }}>
            Are you sure you want to cancel your appointment at <strong>{cancelTarget.salon}</strong> on <strong>{cancelTarget.date}</strong> at <strong>{cancelTarget.time}</strong>?
          </p>
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1 py-3.5 text-sm" onClick={() => setCancelTarget(null)}>Keep Appointment</Btn>
            <Btn variant="danger" className="flex-1 py-3.5 text-sm" onClick={doCancel}>Cancel Appointment</Btn>
          </div>
        </Modal>
      )}

      {/* Cancel Success */}
      {cancelDone && (
        <Modal onClose={() => { setCancelTarget(null); setCancelDone(false); }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl" style={{ background: "#F2EDE5" }}>✕</div>
          <h2 className="font-display text-2xl font-semibold text-center mb-2" style={{ color: "#2C1810" }}>Appointment Cancelled</h2>
          <p className="text-sm text-center mb-3" style={{ color: "#8B7355" }}>Your appointment has been cancelled successfully.</p>
          <p className="text-xs text-center px-4 py-2.5 rounded-xl mb-6" style={{ background: "#F2EDE5", color: "#8B7355" }}>
            Your cancellation has been sent to the salon.
          </p>
          <Btn variant="primary" className="w-full py-3.5 text-sm" onClick={() => { setCancelTarget(null); setCancelDone(false); }}>Done</Btn>
        </Modal>
      )}
    </div>
  );
}

/* ── Simple Modal wrapper ──────────────────────────────── */
function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,14,8,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl anim-in" style={{ background: "white" }}>
        {onClose && <button onClick={onClose} className="absolute top-4 right-4 text-[#8B7355] hover:text-[#2C1810] text-lg">✕</button>}
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APPOINTMENT DETAIL
══════════════════════════════════════════════════════════ */
function ApptDetailPage({ appt, go }: { appt: Appt|null; go: (v: View) => void }) {
  const a = appt || APPTS_INIT[0];
  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <button onClick={() => go("my-appointments")} className="flex items-center gap-1.5 text-sm mb-8 hover:opacity-60 transition-opacity" style={{ color: "#8B7355" }}>
        ← My Appointments
      </button>
      <h1 className="font-display text-3xl font-semibold mb-6" style={{ color: "#2C1810" }}>Appointment Details</h1>

      <div className="rounded-3xl overflow-hidden border mb-5" style={{ background: "white", borderColor: "#E8E0D5" }}>
        <div className="h-40 overflow-hidden bg-amber-50">
          <img src={a.salonImg} alt={a.salon} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-xl" style={{ color: "#2C1810" }}>{a.salon}</h2>
              <p className="text-sm" style={{ color: "#8B7355" }}>Hair Appointment</p>
            </div>
            <Badge status={a.status} />
          </div>
          {[
            { l:"Service",  v:a.service  },
            { l:"Date",     v:a.date     },
            { l:"Time",     v:a.time     },
            { l:"Duration", v:a.duration },
            { l:"Price",    v:`GH₵ ${a.price}` },
            { l:"Booked On",v:a.bookedOn },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between py-3.5 border-t" style={{ borderColor: "#E8E0D5" }}>
              <span className="text-sm" style={{ color: "#8B7355" }}>{l}</span>
              <span className="text-sm font-semibold" style={{ color: l==="Price"?"#C4955A":"#2C1810" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {a.status === "pending" && (
        <Btn variant="danger" className="w-full py-4 text-sm mb-3" onClick={() => go("my-appointments")}>Cancel Appointment</Btn>
      )}
      <Btn variant="primary" className="w-full py-4 text-sm" onClick={() => go("booking")}>Book Again</Btn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════════ */
function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const iconMap: Record<string,{icon:string;bg:string;clr:string}> = {
    approved:  { icon:"✓", bg:"#F0FDF4", clr:"#22C55E" },
    rejected:  { icon:"✕", bg:"#FEF2F2", clr:"#EF4444" },
    cancelled: { icon:"–", bg:"#F9FAFB", clr:"#9CA3AF" },
    request:   { icon:"★", bg:"#FFFBEB", clr:"#F59E0B" },
    reminder:  { icon:"🔔",bg:"#FAF2EE", clr:"#C47A5A" },
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading label="Updates" title="Notifications" />
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} className="text-xs font-semibold self-center -mt-4 hover:opacity-60 transition-opacity" style={{ color: "#C4955A" }}>
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifs.map(n => {
          const c = iconMap[n.type] || iconMap.request;
          return (
            <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id===n.id?{...x,read:true}:x))}
              className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md`}
              style={{ background: n.read?"white":"#FFFDF7", borderColor: n.read?"#E8E0D5":"#F5E6C8" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ background: c.bg, color: c.clr }}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: "#2C1810" }}>{n.title}</h3>
                  <span className="text-xs flex-shrink-0" style={{ color: "#8B7355" }}>{n.time}</span>
                </div>
                <p className="text-xs leading-relaxed mt-1" style={{ color: "#8B7355" }}>{n.body}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#C4955A]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CLIENT DASHBOARD
══════════════════════════════════════════════════════════ */
function ClientDashboardPage({ appts, go, setDetail }: { appts: Appt[]; go: (v: View) => void; setDetail: (a: Appt) => void }) {
  const upcoming  = appts.filter(a => a.status === "approved" || a.status === "pending");
  const pending   = appts.filter(a => a.status === "pending");
  const completed = appts.filter(a => a.status === "completed");

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#8B7355" }}>{greet},</p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: "#2C1810" }}>Zara Asante 👋</h1>
        </div>
        <Btn variant="primary" className="hidden sm:flex px-6 py-3 text-sm" onClick={() => go("find-salon")}>+ Book Appointment</Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label:"Upcoming",       v:upcoming.length,  icon:"📅", clr:"#C4955A" },
          { label:"Pending",        v:pending.length,   icon:"⏳", clr:"#F59E0B" },
          { label:"Completed",      v:completed.length, icon:"✓",  clr:"#22C55E" },
          { label:"Saved Salons",   v:3,                icon:"♥",  clr:"#EF4444" },
        ].map(({ label,v,icon,clr }) => (
          <div key={label} className="rounded-2xl p-5 border" style={{ background:"white", borderColor:"#E8E0D5" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="font-display text-3xl font-semibold" style={{ color:clr }}>{v}</span>
            </div>
            <p className="text-xs font-medium" style={{ color:"#8B7355" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Next appointment */}
          {upcoming[0] && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-4" style={{ color:"#2C1810" }}>Upcoming Appointment</h2>
              <div className="rounded-2xl overflow-hidden border" style={{ background:"white", borderColor:"#E8E0D5" }}>
                <div className="relative h-36 bg-amber-50 overflow-hidden">
                  <img src={upcoming[0].salonImg} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to right,rgba(28,14,8,0.72) 0%,transparent 65%)" }}/>
                  <div className="absolute top-4 left-5">
                    <h3 className="font-display font-semibold text-white text-lg">{upcoming[0].salon}</h3>
                    <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.75)" }}>{upcoming[0].service}</p>
                  </div>
                  <div className="absolute top-4 right-4"><Badge status={upcoming[0].status}/></div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span style={{ color:"#8B7355" }}>📅 {upcoming[0].date}</span>
                    <span style={{ color:"#8B7355" }}>🕐 {upcoming[0].time}</span>
                    <span className="font-semibold" style={{ color:"#C4955A" }}>GH₵ {upcoming[0].price}</span>
                  </div>
                  <div className="flex gap-3">
                    <Btn variant="secondary" className="px-4 py-2 text-xs" onClick={() => { setDetail(upcoming[0]); go("appointment-detail"); }}>View Details</Btn>
                    <Btn variant="danger"    className="px-4 py-2 text-xs" onClick={() => go("my-appointments")}>Cancel</Btn>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold" style={{ color:"#2C1810" }}>Recent Appointments</h2>
              <button onClick={() => go("my-appointments")} className="text-xs font-semibold" style={{ color:"#C4955A" }}>View All →</button>
            </div>
            <div className="space-y-3">
              {appts.slice(1,4).map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background:"white", borderColor:"#E8E0D5" }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                    <img src={a.salonImg} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate" style={{ color:"#2C1810" }}>{a.salon}</span>
                      <Badge status={a.status}/>
                    </div>
                    <span className="text-xs" style={{ color:"#8B7355" }}>{a.service} · {a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Salons */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color:"#2C1810" }}>Saved Salons</h2>
          <div className="space-y-3">
            {SALONS.slice(0,3).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer card-hover" style={{ background:"white", borderColor:"#E8E0D5" }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color:"#2C1810" }}>{s.name}</h3>
                  <p className="text-xs" style={{ color:"#8B7355" }}>★ {s.rating} · {s.city}</p>
                </div>
                <span className="text-red-400">♥</span>
              </div>
            ))}
          </div>
          <Btn variant="secondary" className="w-full py-3 text-xs mt-4" onClick={() => go("find-salon")}>Discover More Salons</Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CLIENT PROFILE  (Screen 15)
══════════════════════════════════════════════════════════ */
function ClientProfilePage({ appts, go }: { appts: Appt[]; go: (v: View) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeading label="Account" title="My Profile" />

      {/* Profile card */}
      <div className="rounded-3xl overflow-hidden border mb-8" style={{ background:"white", borderColor:"#E8E0D5" }}>
        {/* Banner */}
        <div className="h-36 relative overflow-hidden" style={{ background:"linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
          <img src="https://images.unsplash.com/photo-1593351799227-75df2026356b?w=900&h=280&fit=crop&auto=format"
            alt="Banner" className="w-full h-full object-cover opacity-30" />
          <button className="absolute bottom-3 right-4 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/30 text-white" style={{ background:"rgba(255,255,255,0.15)" }}>
            Edit Banner
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 flex-shrink-0" style={{ borderColor:"white" }}>
              <img src="https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?w=200&h=200&fit=crop&auto=format" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color:"#2C1810" }}>Zara Asante</h2>
              <p className="text-sm" style={{ color:"#8B7355" }}>Client · Member since Jan 2025</p>
            </div>
            <Btn variant="secondary" className="ml-auto px-5 py-2.5 text-sm self-end" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit Profile"}
            </Btn>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[["Full Name","Zara Asante"],["Phone","+233 24 567 8901"],["Email","zara@email.com"],["Location","Accra, Ghana"],["Preferred Service","Braiding"],["Date of Birth","March 15, 1995"]].map(([l,v]) => (
                <div key={l}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color:"#8B7355" }}>{l}</label>
                  <input defaultValue={v} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A] transition-colors" style={{ borderColor:"#E8E0D5", background:"#FAF7F2", color:"#2C1810" }} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Btn variant="primary" className="px-8 py-3 text-sm mt-2" onClick={() => setEditing(false)}>Save Changes</Btn>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[["Full Name","Zara Asante"],["Phone","+233 24 567 8901"],["Email","zara@email.com"],["Location","Accra, Ghana"],["Preferred Service","Braiding"],["Member Since","January 2025"]].map(([l,v]) => (
                <div key={l} className="py-3 border-b last:border-0" style={{ borderColor:"#F2EDE5" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color:"#8B7355" }}>{l}</p>
                  <p className="text-sm font-medium" style={{ color:"#2C1810" }}>{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label:"Total Appointments", v:appts.length,              clr:"#C4955A" },
          { label:"Completed",          v:appts.filter(a=>a.status==="completed").length, clr:"#22C55E" },
          { label:"Saved Salons",       v:3,                         clr:"#EF4444" },
        ].map(({ label,v,clr }) => (
          <div key={label} className="rounded-2xl p-4 border text-center" style={{ background:"white", borderColor:"#E8E0D5" }}>
            <p className="font-display text-3xl font-semibold mb-1" style={{ color:clr }}>{v}</p>
            <p className="text-xs" style={{ color:"#8B7355" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-5 border" style={{ borderColor:"#FECACA", background:"#FEF2F2" }}>
        <h3 className="font-semibold text-sm mb-1 text-red-700">Account Actions</h3>
        <p className="text-xs mb-4 text-red-500">These actions are irreversible. Please proceed with caution.</p>
        <div className="flex gap-3">
          <Btn variant="danger" className="px-5 py-2.5 text-xs">Delete Account</Btn>
          <Btn variant="secondary" className="px-5 py-2.5 text-xs" onClick={() => go("salon-login")}>Sign Out</Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REVIEWS PAGE
══════════════════════════════════════════════════════════ */
function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <SectionLabel>Testimonials</SectionLabel>
        <h1 className="font-display text-5xl font-semibold mt-2 mb-4" style={{ color:"#2C1810" }}>What Our Clients Say</h1>
        <div className="inline-flex flex-col items-center gap-1.5">
          <div className="flex items-end gap-2">
            <span className="font-display text-5xl font-semibold" style={{ color:"#2C1810" }}>4.8</span>
            <span className="font-display text-3xl mb-1" style={{ color:"#8B7355" }}>/5</span>
          </div>
          <Stars n={5} size={20} />
          <p className="text-sm mt-1" style={{ color:"#8B7355" }}>Based on 2,400+ reviews</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REVIEWS.map(r => (
          <div key={r.id} className="rounded-2xl p-6 border flex flex-col" style={{ background:"white", borderColor:"#E8E0D5" }}>
            <Stars n={r.stars} />
            <p className="text-sm leading-relaxed my-4 flex-1" style={{ color:"#8B7355" }}>"{r.text}"</p>
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor:"#E8E0D5" }}>
              <Avi initials={r.init} size="sm" />
              <div>
                <p className="font-semibold text-sm" style={{ color:"#2C1810" }}>{r.name}</p>
                <p className="text-xs" style={{ color:"#8B7355" }}>{r.salon} · {r.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <SectionLabel>Testimonials</SectionLabel>
        <h2 className="font-display text-4xl font-semibold mt-2" style={{ color:"#2C1810" }}>What Our Clients Say</h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Stars n={5} />
          <span className="font-semibold text-sm" style={{ color:"#2C1810" }}>4.8 / 5</span>
          <span className="text-sm" style={{ color:"#8B7355" }}>· 2,400+ reviews</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {REVIEWS.slice(0,3).map(r => (
          <div key={r.id} className="rounded-2xl p-6 border" style={{ background:"white", borderColor:"#E8E0D5" }}>
            <Stars n={r.stars} />
            <p className="text-sm leading-relaxed my-4" style={{ color:"#8B7355" }}>"{r.text}"</p>
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor:"#E8E0D5" }}>
              <Avi initials={r.init} size="sm" />
              <div>
                <p className="font-semibold text-sm" style={{ color:"#2C1810" }}>{r.name}</p>
                <p className="text-xs" style={{ color:"#8B7355" }}>{r.salon}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SALON OWNER LOGIN  (Screen 17)
══════════════════════════════════════════════════════════ */
function SalonLoginPage({ go }: { go: (v: View) => void }) {
  const [form, setForm] = useState({ email:"", password:"", remember: false });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#C4955A 0%,#2C1810 100%)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
              <path d="M9 16.5c.85.63 1.88 1 3 1s2.15-.37 3-1"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-2xl" style={{ color:"#2C1810" }}>StyleHub</span>
        </div>

        <div className="rounded-3xl border p-8 shadow-xl" style={{ background:"white", borderColor:"#E8E0D5" }}>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2" style={{ color:"#2C1810" }}>Salon Owner Login</h1>
            <p className="text-sm" style={{ color:"#8B7355" }}>Sign in to manage your salon and appointments.</p>
          </div>

          <div className="space-y-4 mb-6">
            {[
              { label:"Email Address", type:"email",    placeholder:"hello@salon.com",  key:"email"    },
              { label:"Password",      type:"password", placeholder:"Enter your password",key:"password" },
            ].map(({ label, type, placeholder, key }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color:"#8B7355" }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none focus:border-[#C4955A] transition-colors" style={{ borderColor:"#E8E0D5", background:"#FAF7F2", color:"#2C1810" }} />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.remember} onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))} className="w-4 h-4 rounded accent-amber-700" />
                <span className="text-sm" style={{ color:"#8B7355" }}>Remember me</span>
              </label>
              <button className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color:"#C4955A" }}>Forgot password?</button>
            </div>
          </div>

          <Btn variant="primary" className="w-full py-4 text-sm mb-4" onClick={() => go("salon-dashboard")}>Sign In to Salon Dashboard</Btn>

          <div className="relative flex items-center justify-center my-4">
            <div className="flex-1 h-px" style={{ background:"#E8E0D5" }} />
            <span className="px-3 text-xs" style={{ color:"#8B7355" }}>or</span>
            <div className="flex-1 h-px" style={{ background:"#E8E0D5" }} />
          </div>

          <button className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 border hover:bg-[#F2EDE5] transition-colors" style={{ borderColor:"#E8E0D5", color:"#2C1810" }}>
            <span className="text-lg">G</span> Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color:"#8B7355" }}>
            New to StyleHub?{" "}
            <button className="font-semibold hover:opacity-70 transition-opacity" style={{ color:"#C4955A" }}>Register your salon</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SALON DASHBOARD  (Screen 18)
══════════════════════════════════════════════════════════ */
function SalonDashboardPage({ go }: { go: (v: View) => void }) {
  const todaySchedule = [
    { time:"09:00", client:null },
    { time:"09:30", client:null },
    { time:"10:00", client:{ name:"Sarah Mensah",   svc:"Box Braids",    bg:"#FFF8EE", border:"#F5E6C8" } },
    { time:"10:30", client:{ name:"Sarah Mensah",   svc:"(cont.)",        bg:"#FFF8EE", border:"#F5E6C8" } },
    { time:"11:00", client:null },
    { time:"11:30", client:{ name:"John Asante",    svc:"Haircut",        bg:"#F0FDF4", border:"#BBF7D0" } },
    { time:"12:00", client:null },
    { time:"12:30", client:{ name:"Amara Osei",     svc:"Cornrows",       bg:"#FAF2EE", border:"#EACDBE" } },
    { time:"13:00", client:{ name:"Amara Osei",     svc:"(cont.)",        bg:"#FAF2EE", border:"#EACDBE" } },
    { time:"13:30", client:null },
    { time:"14:00", client:{ name:"Fatima Diallo",  svc:"Weaving",        bg:"#FFF8EE", border:"#F5E6C8" } },
    { time:"15:00", client:{ name:"Nana Boateng",   svc:"Hair Treatment", bg:"#F0FDF4", border:"#BBF7D0" } },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <SectionLabel>Salon Owner</SectionLabel>
          <h1 className="font-display text-4xl font-semibold mt-1.5" style={{ color:"#2C1810" }}>Salon Dashboard</h1>
          <p className="text-sm mt-1" style={{ color:"#8B7355" }}>Glam Studio · Accra, Ghana</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Btn variant="secondary" className="px-5 py-2.5 text-sm" onClick={() => go("salon-calendar")}>📅 Calendar</Btn>
          <Btn variant="primary"   className="px-5 py-2.5 text-sm" onClick={() => go("manage-services")}>Manage Services</Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label:"Today's Appointments", v:6, icon:"📅", clr:"#C4955A" },
          { label:"Pending Requests",     v:3, icon:"⏳", clr:"#F59E0B" },
          { label:"This Week",            v:18,icon:"📊", clr:"#C47A5A" },
          { label:"Completed Today",      v:4, icon:"✓",  clr:"#22C55E" },
        ].map(({ label,v,icon,clr }) => (
          <div key={label} className="rounded-2xl p-5 border" style={{ background:"white", borderColor:"#E8E0D5" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="font-display text-3xl font-semibold" style={{ color:clr }}>{v}</span>
            </div>
            <p className="text-xs font-medium" style={{ color:"#8B7355" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today schedule */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color:"#2C1810" }}>Today's Schedule</h2>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background:"#F2EDE5", color:"#8B7355" }}>Fri, Sep 5, 2026</span>
          </div>
          <div className="space-y-2">
            {todaySchedule.map(({ time, client }) => (
              <div key={time} className={`flex items-center gap-4 px-4 py-2.5 rounded-xl ${client?"border":""}`}
                style={ client ? { background:(client as any).bg, borderColor:(client as any).border } : {} }>
                <span className="text-xs font-mono w-12 flex-shrink-0" style={{ color: client?"#2C1810":"#C4B09A" }}>{time}</span>
                {client
                  ? <div className="flex items-center justify-between flex-1 text-sm">
                      <span className="font-semibold" style={{ color:"#2C1810" }}>{(client as any).name}</span>
                      <span className="text-xs" style={{ color:"#8B7355" }}>— {(client as any).svc}</span>
                    </div>
                  : <div className="flex-1 h-px" style={{ background:"#E8E0D5" }} />
                }
              </div>
            ))}
          </div>
        </div>

        {/* Pending requests */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color:"#2C1810" }}>Pending Requests</h2>
            <button onClick={() => go("appointment-requests")} className="text-xs font-semibold" style={{ color:"#C4955A" }}>View All →</button>
          </div>
          <div className="space-y-3">
            {SALON_REQUESTS.filter(r=>r.status==="pending").slice(0,3).map(r => (
              <RequestCard key={r.id} req={r} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ req, compact = false }: { req: typeof SALON_REQUESTS[0]; compact?: boolean }) {
  const [status, setStatus] = useState(req.status);

  return (
    <div className="rounded-2xl border p-4" style={{ background:"white", borderColor: status==="pending"?"#F5E6C8":"#E8E0D5" }}>
      <div className="flex items-center gap-2.5 mb-2">
        <Avi initials={req.init} size="sm" />
        <div>
          <p className="font-semibold text-sm" style={{ color:"#2C1810" }}>{req.client}</p>
          <p className="text-xs" style={{ color:"#8B7355" }}>{req.service}</p>
        </div>
        {!compact && <div className="ml-auto"><Badge status={status}/></div>}
      </div>
      <p className="text-xs mb-3" style={{ color:"#8B7355" }}>📅 {req.date} · 🕐 {req.time} · ⏱ {req.dur}</p>
      {status === "pending"
        ? <div className="flex gap-2">
            <button onClick={() => setStatus("approved")} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background:"#22C55E" }}>✓ Approve</button>
            <button onClick={() => setStatus("rejected")} className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-red-50" style={{ color:"#EF4444", borderColor:"#FECACA", background:"#FEF2F2" }}>✕ Reject</button>
          </div>
        : <p className="text-xs text-center py-1.5 rounded-xl" style={{ background:"#F2EDE5", color:"#8B7355" }}>
            {status==="approved"?"✓ Approved":"✕ Rejected"}
          </p>
      }
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APPOINTMENT REQUESTS  (Screen 19)
══════════════════════════════════════════════════════════ */
function AppointmentRequestsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeading label="Salon Owner" title="Appointment Requests" sub="Review and respond to incoming booking requests." />
      <div className="space-y-4">
        {SALON_REQUESTS.map(r => (
          <div key={r.id} className="rounded-2xl border overflow-hidden" style={{ background:"white", borderColor: r.status==="pending"?"#F5E6C8":"#E8E0D5" }}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avi initials={r.init} />
                  <div>
                    <h3 className="font-semibold" style={{ color:"#2C1810" }}>{r.client}</h3>
                    <p className="text-sm" style={{ color:"#8B7355" }}>{r.service}</p>
                  </div>
                </div>
                <Badge status={r.status}/>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[["📅 Date",r.date],["🕐 Time",r.time],["⏱ Duration",r.dur],["💰 Price",`GH₵ ${r.price}`]].map(([l,v]) => (
                  <div key={l} className="p-3 rounded-xl" style={{ background:"#F2EDE5" }}>
                    <p className="text-[11px]" style={{ color:"#8B7355" }}>{l}</p>
                    <p className="font-semibold text-sm mt-0.5" style={{ color:"#2C1810" }}>{v}</p>
                  </div>
                ))}
              </div>
              <RequestCard req={r} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SALON CALENDAR  (Screen 20)
══════════════════════════════════════════════════════════ */
function SalonCalendarPage() {
  const [calView, setCalView] = useState<"day"|"week">("day");

  const daySlots = [
    { time:"09:00", entry:null },
    { time:"09:30", entry:null },
    { time:"10:00", entry:{ name:"Sarah Mensah",  svc:"Box Braids",    bg:"#FFF8EE", brd:"#F5E6C8" } },
    { time:"10:30", entry:{ name:"Sarah Mensah",  svc:"Box Braids",    bg:"#FFF8EE", brd:"#F5E6C8" } },
    { time:"11:00", entry:null },
    { time:"11:30", entry:{ name:"John Asante",   svc:"Haircut",       bg:"#F0FDF4", brd:"#BBF7D0" } },
    { time:"12:00", entry:null },
    { time:"12:30", entry:{ name:"Amara Osei",    svc:"Cornrows",      bg:"#FAF2EE", brd:"#EACDBE" } },
    { time:"13:00", entry:{ name:"Amara Osei",    svc:"Cornrows",      bg:"#FAF2EE", brd:"#EACDBE" } },
    { time:"13:30", entry:null },
    { time:"14:00", entry:{ name:"Fatima Diallo", svc:"Weaving",       bg:"#FFF8EE", brd:"#F5E6C8" } },
    { time:"14:30", entry:{ name:"Fatima Diallo", svc:"Weaving",       bg:"#FFF8EE", brd:"#F5E6C8" } },
    { time:"15:00", entry:null },
    { time:"15:30", entry:{ name:"Nana Boateng",  svc:"Hair Treatment",bg:"#F0FDF4", brd:"#BBF7D0" } },
    { time:"16:00", entry:null },
    { time:"16:30", entry:null },
  ];

  const weekDays = ["Mon 7","Tue 8","Wed 9","Thu 10","Fri 11"];
  const weekData: (string|null)[][] = [
    [null,"Kofi – Cut",null,"Sarah – Braids",null],
    [null,"Kofi – Cut",null,"Sarah – Braids",null],
    ["Amara – Cornrows",null,"Yemi – Weave",null,null],
    ["Amara – Cornrows",null,"Yemi – Weave",null,null],
    [null,null,"Yemi – Weave",null,"Nana – Treat"],
    [null,null,null,null,"Nana – Treat"],
    [null,null,null,null,null],
    ["Fatima – Braids",null,null,"John – Cut",null],
    ["Fatima – Braids",null,null,null,null],
    ["Fatima – Braids",null,null,null,null],
    [null,"Adwoa – Locs",null,null,null],
    [null,"Adwoa – Locs",null,null,null],
  ];
  const weekTimes = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading label="Salon Owner" title="Appointment Calendar" />
        <div className="flex items-center gap-2 p-1 rounded-2xl border" style={{ background:"white", borderColor:"#E8E0D5" }}>
          {(["day","week"] as const).map(v => (
            <button key={v} onClick={() => setCalView(v)} className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${calView===v?"text-[#2C1810] shadow-sm":"text-[#8B7355] hover:text-[#2C1810]"}`}
              style={{ background: calView===v?"white":"transparent" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Day view */}
      {calView === "day" && (
        <div className="rounded-3xl border overflow-hidden" style={{ background:"white", borderColor:"#E8E0D5" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor:"#E8E0D5" }}>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F2EDE5] text-lg">‹</button>
            <span className="font-semibold" style={{ color:"#2C1810" }}>Friday, September 5, 2026</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F2EDE5] text-lg">›</button>
          </div>
          <div className="p-5 space-y-2">
            {daySlots.map(({ time, entry }) => (
              <div key={time} className="flex items-center gap-4">
                <span className="text-xs font-mono w-12 text-right flex-shrink-0" style={{ color:"#B0967A" }}>{time}</span>
                <div className="flex-1">
                  {entry
                    ? <div className="px-4 py-2.5 rounded-xl border text-sm" style={{ background:(entry as any).bg, borderColor:(entry as any).brd }}>
                        <span className="font-semibold" style={{ color:"#2C1810" }}>{(entry as any).name}</span>
                        <span className="ml-2 text-xs" style={{ color:"#8B7355" }}>— {(entry as any).svc}</span>
                      </div>
                    : <div className="px-4 py-2 rounded-xl text-xs" style={{ color:"#C4B09A", background:"#FAF7F2" }}>Available</div>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week view */}
      {calView === "week" && (
        <div className="rounded-3xl border overflow-hidden" style={{ background:"white", borderColor:"#E8E0D5" }}>
          <div className="grid" style={{ gridTemplateColumns:"56px repeat(5,1fr)" }}>
            <div className="py-3 border-b border-r" style={{ borderColor:"#E8E0D5" }} />
            {weekDays.map(d => (
              <div key={d} className="py-3 border-b border-r last:border-r-0 text-center text-xs font-semibold" style={{ borderColor:"#E8E0D5", color:"#2C1810" }}>{d}</div>
            ))}
          </div>
          {weekData.map((row, ri) => (
            <div key={ri} className="grid border-b last:border-b-0" style={{ gridTemplateColumns:"56px repeat(5,1fr)", borderColor:"#E8E0D5" }}>
              <div className="py-2 border-r text-right pr-3 text-[11px] font-mono flex items-center justify-end" style={{ color:"#B0967A", borderColor:"#E8E0D5" }}>{weekTimes[ri]}</div>
              {row.map((cell, ci) => (
                <div key={ci} className="p-1 border-r last:border-r-0 min-h-[38px]" style={{ borderColor:"#E8E0D5" }}>
                  {cell && (
                    <div className="w-full h-full rounded-lg px-2 py-1 text-[11px] font-medium" style={{ background:"#FFF8EE", color:"#2C1810", border:"1px solid #F5E6C8" }}>
                      {cell}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MANAGE SERVICES  (Screen 21)
══════════════════════════════════════════════════════════ */
function ManageServicesPage() {
  const [svcs, setSvcs] = useState(SERVICES_LIST.map(s => ({ ...s, active: true })));
  const [editId, setEditId] = useState<string|null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading label="Salon Owner" title="Manage Services" />
        <Btn variant="primary" className="px-5 py-2.5 text-sm">+ Add Service</Btn>
      </div>

      <div className="space-y-3">
        {svcs.map(s => (
          <div key={s.id} className="rounded-2xl border p-4 sm:p-5" style={{ background:"white", borderColor:"#E8E0D5" }}>
            {editId === s.id
              ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input defaultValue={s.name} className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A]" style={{ borderColor:"#E8E0D5", color:"#2C1810" }} />
                    <input defaultValue={s.dur}  className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A]" style={{ borderColor:"#E8E0D5", color:"#2C1810" }} />
                    <input defaultValue={`${s.price}`} type="number" className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A]" style={{ borderColor:"#E8E0D5", color:"#2C1810" }} />
                  </div>
                  <textarea defaultValue={s.desc} rows={2} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A] resize-none" style={{ borderColor:"#E8E0D5", color:"#2C1810" }} />
                  <div className="flex gap-2">
                    <Btn variant="primary" className="px-5 py-2 text-xs" onClick={() => setEditId(null)}>Save</Btn>
                    <Btn variant="secondary" className="px-5 py-2 text-xs" onClick={() => setEditId(null)}>Cancel</Btn>
                  </div>
                </div>
              )
              : (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm" style={{ color:"#2C1810" }}>{s.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background:"#F2EDE5", color:"#8B7355" }}>{s.dur}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${s.active?"bg-green-50 text-green-700":"bg-gray-100 text-gray-500"}`}>{s.active?"Active":"Hidden"}</span>
                    </div>
                    <p className="text-xs" style={{ color:"#8B7355" }}>{s.desc}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color:"#C4955A" }}>GH₵ {s.price}</span>
                    {/* Toggle */}
                    <button onClick={() => setSvcs(sv => sv.map(x => x.id===s.id?{...x,active:!x.active}:x))}
                      className="w-11 h-6 rounded-full relative transition-colors"
                      style={{ background: s.active?"#2C1810":"#E8E0D5" }}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${s.active?"left-[22px]":"left-0.5"}`} />
                    </button>
                    <button className="text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color:"#C4955A" }} onClick={() => setEditId(s.id)}>Edit</button>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SALON PROFILE  (Screen 22)
══════════════════════════════════════════════════════════ */
function SalonProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeading label="Salon Owner" title="Salon Profile" sub="How clients see your salon on StyleHub." />

      <div className="rounded-3xl border overflow-hidden mb-6" style={{ background:"white", borderColor:"#E8E0D5" }}>
        {/* Cover */}
        <div className="relative h-44 overflow-hidden bg-amber-100">
          <img src={SALONS[0].cover} alt="Cover" className="w-full h-full object-cover" />
          <Btn variant="secondary" className="absolute bottom-3 right-3 px-3 py-1.5 text-xs">Edit Cover</Btn>
        </div>

        <div className="p-6">
          {/* Logo row */}
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <div className="w-22 h-22 w-20 h-20 rounded-2xl overflow-hidden border-4 flex-shrink-0" style={{ borderColor:"white" }}>
              <img src={SALONS[0].img} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <button className="mb-1.5 text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color:"#C4955A" }}>Change Photo</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Salon Name",     "Glam Studio"],
              ["City / Location","Accra, Ghana"],
              ["Phone",          "+233 20 123 4567"],
              ["Email",          "hello@glamstudio.gh"],
              ["Opening Hours",  "9:00 AM – 7:00 PM"],
              ["Instagram",      "@glamstudio_gh"],
            ].map(([l,v]) => (
              <div key={l}>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color:"#8B7355" }}>{l}</label>
                <input defaultValue={v} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[#C4955A] transition-colors" style={{ borderColor:"#E8E0D5", background:"#FAF7F2", color:"#2C1810" }} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color:"#8B7355" }}>About the Salon</label>
              <textarea defaultValue={SALONS[0].about} rows={3} className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#C4955A] transition-colors resize-none" style={{ borderColor:"#E8E0D5", background:"#FAF7F2", color:"#2C1810" }} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Btn variant="primary"   className="px-8 py-3.5 text-sm">Save Changes</Btn>
            <Btn variant="secondary" className="px-6 py-3.5 text-sm">Preview Profile</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [view,    setView]    = useState<View>("home");
  const [appts,   setAppts]   = useState<Appt[]>(APPTS_INIT);
  const [detail,  setDetail]  = useState<Appt|null>(null);

  const unread = NOTIFS.filter(n => !n.read).length;

  // Wrap setView to scroll to top on navigation
  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const noFooter: View[] = ["booking","booking-sent","salon-login"];
  const salonOwnerViews: View[] = ["salon-login","salon-dashboard","appointment-requests","salon-calendar","manage-services","salon-profile"];
  const isSalonOwner = salonOwnerViews.includes(view);

  function renderView() {
    switch (view) {
      case "home":                  return <HomePage go={go} />;
      case "find-salon":            return <FindSalonPage go={go} />;
      case "services":              return <ServicesPage go={go} />;
      case "salon-detail":          return <SalonDetailPage go={go} />;
      case "booking":               return <BookingPage go={go} />;
      case "booking-sent":          return <BookingSentPage go={go} />;
      case "my-appointments":       return <MyAppointmentsPage appts={appts} setAppts={setAppts} go={go} setDetail={setDetail} />;
      case "appointment-detail":    return <ApptDetailPage appt={detail} go={go} />;
      case "notifications":         return <NotificationsPage />;
      case "client-dashboard":      return <ClientDashboardPage appts={appts} go={go} setDetail={setDetail} />;
      case "client-profile":        return <ClientProfilePage appts={appts} go={go} />;
      case "reviews":               return <ReviewsPage />;
      case "salon-login":           return <SalonLoginPage go={go} />;
      case "salon-dashboard":       return <SalonDashboardPage go={go} />;
      case "appointment-requests":  return <AppointmentRequestsPage />;
      case "salon-calendar":        return <SalonCalendarPage />;
      case "manage-services":       return <ManageServicesPage />;
      case "salon-profile":         return <SalonProfilePage />;
      default:                      return <HomePage go={go} />;
    }
  }

  return (
    <div className="min-h-full" style={{ background:"#FAF7F2" }}>
      <Nav current={view} go={go} unread={unread} />

      {/* Salon owner sub-nav strip */}
      {isSalonOwner && view !== "salon-login" && (
        <div className="fixed top-16 inset-x-0 z-40 border-b flex items-center gap-1 px-6 py-2 glass" style={{ borderColor:"#E8E0D5" }}>
          {([
            { label:"Dashboard",  v:"salon-dashboard"       as View },
            { label:"Requests",   v:"appointment-requests"  as View },
            { label:"Calendar",   v:"salon-calendar"        as View },
            { label:"Services",   v:"manage-services"       as View },
            { label:"Profile",    v:"salon-profile"         as View },
          ]).map(({ label, v }) => (
            <button key={v} onClick={() => go(v)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${view===v?"bg-[#2C1810] text-white":"text-[#8B7355] hover:bg-[#F2EDE5]"}`}>
              {label}
            </button>
          ))}
          <button onClick={() => go("home")} className="ml-auto text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color:"#8B7355" }}>
            ← Back to Client View
          </button>
        </div>
      )}

      <div style={{ paddingTop: isSalonOwner && view !== "salon-login" ? "6.5rem" : "4rem" }}>
        {renderView()}
      </div>

      {!noFooter.includes(view) && <Footer go={go} />}

      {/* Mobile bottom nav */}
      <MobileNav current={view} go={go} />
    </div>
  );
}
