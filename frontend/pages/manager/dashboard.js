import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Users,
  Plus,
  Pencil,
  Circle,
} from "lucide-react";
import ManagerLayout from "@/components/manager/ManagerLayout";
import { managerMockClient } from "@/services/managerMockClient";

const STATUS_LABEL = {
  active: "Đang hoạt động",
  draft: "Đang chờ duyệt",
  inactive: "Không hoạt động",
};
const STATUS_COLOR = {
  active: "mgr-chip--green",
  draft: "mgr-chip--amber",
  inactive: "mgr-chip--gray",
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!sessionStorage.getItem("managerToken")) {
      router.replace("/manager/login");
      return;
    }
    managerMockClient.stats().then(setStats);
  }, [router]);

  if (!stats) {
    return (
      <ManagerLayout>
        <div className="mgr-loading">
          <div className="loading-spinner" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout searchPlaceholder="Tìm kiếm POI…">
      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="mgr-stat-row">
        {/* Total */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-card-body">
            <div>
              <p className="mgr-stat-label">Tổng số POIS</p>
              <p className="mgr-stat-value">{stats.total.toLocaleString()}</p>
              <p className="mgr-stat-trend">
                <TrendingUp size={14} />
                +12% so với tháng trước
              </p>
            </div>
            <div className="mgr-stat-icon">
              <MapPin size={22} />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="mgr-stat-card mgr-stat-card--teal">
          <div className="mgr-stat-card-body">
            <div>
              <p className="mgr-stat-label" style={{ color: "#ccfbf1" }}>
                ĐANG HOẠT ĐỘNG
              </p>
              <p className="mgr-stat-value" style={{ color: "#fff" }}>
                {stats.active}
              </p>
              <div className="mgr-stat-avatars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className="mgr-stat-avatar">
                    <Users size={10} />
                  </span>
                ))}
                <span className="mgr-stat-avatar-more">+15</span>
              </div>
              <p style={{ color: "#99f6e4", fontSize: 12, margin: "4px 0 0" }}>
                Người quản lý trực tuyến
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent POIs table ─────────────────────────────────────────── */}
      <div className="mgr-card" style={{ marginTop: 24 }}>
        <div className="mgr-card-header">
          <h2 className="mgr-card-title">POI Gần đây</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="mgr-icon-btn" type="button" aria-label="Lọc">
              {/* filter bars icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            </button>
            <button className="mgr-icon-btn" type="button" aria-label="Thêm tùy chọn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </div>

        <table className="mgr-table">
          <thead>
            <tr>
              <th>TÊN ĐỊA ĐIỂM</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((poi) => (
              <tr key={poi.id}>
                <td>
                  <div className="mgr-table-name-cell">
                    <div className="mgr-table-thumb">
                      {poi.images?.[0] ? (
                        <img src={poi.images[0]} alt="" />
                      ) : (
                        <MapPin size={14} />
                      )}
                    </div>
                    <div>
                      <span className="mgr-table-poi-name">{poi.name}</span>
                      <span className="mgr-table-poi-sub">
                        {poi.category} • {poi.rating && `${poi.rating} Rating`}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`mgr-chip ${STATUS_COLOR[poi.status] || "mgr-chip--gray"}`}>
                    <Circle size={6} style={{ fill: "currentColor" }} />
                    {STATUS_LABEL[poi.status] || poi.status}
                  </span>
                </td>
                <td className="mgr-table-date">{poi.updated_at}</td>
                <td>
                  <Link href={`/manager/locations/${poi.id}`} className="mgr-icon-btn" aria-label="Sửa">
                    <Pencil size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mgr-card-footer">
          <Link href="/manager/locations" className="mgr-link-more">
            Xem tất cả địa điểm →
          </Link>
        </div>
      </div>

      {/* ── CTA panel ─────────────────────────────────────────────────── */}
      <div className="mgr-cta-panel">
        <h3 className="mgr-cta-title">Tạo địa điểm mới?</h3>
        <p className="mgr-cta-desc">
          Thêm các điểm tham quan, nhà hàng hoặc cửa hàng mới vào hệ thống quản lý của bạn.
        </p>
        <Link href="/manager/locations/new" className="mgr-btn mgr-btn--outline-white">
          <Plus size={16} />
          Tạo POI mới
        </Link>
      </div>
    </ManagerLayout>
  );
}
