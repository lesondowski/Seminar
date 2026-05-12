import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, LayoutDashboard, LogOut, MapPinned, Search, ShieldCheck, Ticket } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pois", label: "Quản lý POI", icon: MapPinned },
  { href: "/admin/tours", label: "Tours", icon: Ticket },
];

export default function AdminLayout({ title, subtitle, action, children }) {
  const router = useRouter();

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>POI Manager</strong>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link${active ? " admin-sidebar-link--active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-card">
          <p className="admin-sidebar-card-label">Quyền truy cập</p>
          <strong>Business Admin</strong>
          <span>Toàn quyền quản trị dữ liệu POI và tour trên hệ thống.</span>
        </div>

        <button type="button" className="admin-sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          Đăng xuất
        </button>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">{title}</h1>
            {subtitle ? <p className="admin-page-subtitle">{subtitle}</p> : null}
          </div>

          <div className="admin-topbar-actions">
            <label className="admin-topbar-search">
              <Search size={16} />
              <input placeholder="Tìm kiếm POI..." />
            </label>
            <button type="button" className="admin-topbar-icon-btn" aria-label="Thông báo">
              <Bell size={18} />
            </button>
            {action}
          </div>
        </header>

        <main className="admin-page-body">{children}</main>
      </div>
    </div>
  );
}