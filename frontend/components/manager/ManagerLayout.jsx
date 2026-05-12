import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  MapPin,
  BarChart2,
  Settings,
  Search,
  Bell,
  User,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manager/locations", label: "My Locations", icon: MapPin },
  { href: "/manager/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/manager/settings", label: "Settings", icon: Settings },
];

export default function ManagerLayout({ children, searchPlaceholder }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("managerDisplayName") || "Store Manager"
      : "Store Manager";

  function handleLogout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("managerToken");
      sessionStorage.removeItem("managerDisplayName");
    }
    router.replace("/manager/login");
  }

  const isActive = (href) => router.pathname.startsWith(href);

  return (
    <div className="mgr-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`mgr-sidebar${sidebarOpen ? " mgr-sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="mgr-sidebar-logo">
          <MapPin size={18} className="mgr-sidebar-logo-icon" />
          <span>POI Manager</span>
        </div>

        {/* Profile chip */}
        <div className="mgr-sidebar-profile">
          <div className="mgr-avatar" aria-hidden="true">
            <User size={16} />
          </div>
          <div className="mgr-sidebar-profile-text">
            <span className="mgr-sidebar-profile-name">{displayName}</span>
            <span className="mgr-sidebar-profile-role">Business Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="mgr-sidebar-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`mgr-nav-item${isActive(href) ? " mgr-nav-item--active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="mgr-sidebar-bottom">
          <Link href="/manager/locations/new" className="mgr-sidebar-cta" onClick={() => setSidebarOpen(false)}>
            <Plus size={16} />
            New Location
          </Link>
          <button className="mgr-sidebar-logout" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="mgr-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="mgr-main">
        {/* Top bar */}
        <header className="mgr-topbar">
          <button
            className="mgr-topbar-menu"
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search */}
          <div className="mgr-topbar-search">
            <Search size={16} className="mgr-topbar-search-icon" />
            <input
              placeholder={searchPlaceholder || "Search locations..."}
              className="mgr-topbar-search-input"
            />
          </div>

          {/* Right icons */}
          <div className="mgr-topbar-right">
            <button className="mgr-topbar-icon" type="button" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="mgr-topbar-icon" type="button" aria-label="Account">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mgr-content">{children}</main>
      </div>
    </div>
  );
}
