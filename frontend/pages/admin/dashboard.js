import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  ZoomIn,
  ZoomOut,
  TrendingUp,
  Users,
  MapPin,
  Plus,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminPois, getMonitorOnlineDevices } from "@/services/adminClient";

// Mock chart data (session-level chart would need a real analytics endpoint)
const CHART_DATA = [
  { day: "Th2", views: 450 },
  { day: "Th3", views: 620 },
  { day: "Th4", views: 480 },
  { day: "Th5", views: 350 },
  { day: "Th6", views: 1100 },
  { day: "Th7", views: 1250 },
  { day: "CN", views: 780 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total_pois: null, active_users: null });
  const [statsError, setStatsError] = useState("");

  const loadStats = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) return;

    setStatsError("");
    try {
      const [poisRes, monitorRes] = await Promise.allSettled([
        getAdminPois(token),
        getMonitorOnlineDevices(5),
      ]);

      const totalPois =
        poisRes.status === "fulfilled" && Array.isArray(poisRes.value?.data)
          ? poisRes.value.data.length
          : null;

      const activeUsers =
        monitorRes.status === "fulfilled" &&
        monitorRes.value?.total_online_devices != null
          ? monitorRes.value.total_online_devices
          : null;

      setStats({ total_pois: totalPois, active_users: activeUsers });
    } catch {
      setStatsError("Không thể tải số liệu thống kê");
    }
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("adminToken")) {
      router.replace("/admin/login");
      return;
    }
    void loadStats();
  }, [router, loadStats]);

  function handleRefresh() {
    setRefreshing(true);
    void loadStats().finally(() => setRefreshing(false));
  }

  function handleZoomIn() {
    setZoomLevel((z) => Math.min(z + 0.2, 2));
  }

  function handleZoomOut() {
    setZoomLevel((z) => Math.max(z - 0.2, 0.8));
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Tổng quan hoạt động hệ thống POI quản lý"
      action={(
        <Link href="/admin/pois" className="btn btn--primary">
          <MapPin size={16} />
          Quản lý POI
        </Link>
      )}
    >
      <section className="admin-dashboard-shell">

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {statsError && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: 16 }}>
          {statsError}
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="admin-stat-grid">
        {/* Total POIs */}
        <div className="admin-stat-card">
          <div className="admin-stat-body">
            <div className="admin-stat-content">
              <p className="admin-stat-label">TỔNG SỐ POIS</p>
              <p className="admin-stat-value">
                {stats.total_pois === null ? (
                  <span className="admin-stat-loading">...</span>
                ) : (
                  stats.total_pois.toLocaleString()
                )}
              </p>
              <div className="admin-stat-trend">
                <TrendingUp size={14} />
                <span>Từ cơ sở dữ liệu</span>
              </div>
            </div>
            <div className="admin-stat-icon">
              <MapPin size={28} />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="admin-stat-card admin-stat-card--teal">
          <div className="admin-stat-body">
            <div className="admin-stat-content">
              <p className="admin-stat-label" style={{ color: "#ccfbf1" }}>
                NGƯỜI DÙNG HOẠT ĐỘNG
              </p>
              <p className="admin-stat-value" style={{ color: "#fff" }}>
                {stats.active_users === null ? (
                  <span className="admin-stat-loading">...</span>
                ) : (
                  stats.active_users
                )}
              </p>
              <div className="admin-stat-avatars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className="admin-stat-avatar">
                    <Users size={11} />
                  </span>
                ))}
              </div>
              <p style={{ color: "#99f6e4", fontSize: 12, marginTop: 6 }}>
                Khách tham quan đang sử dụng (5 phút gần nhất)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart & CTA row ─────────────────────────────────────────────────── */}
      <div className="admin-chart-row">
        {/* Chart card */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h2 className="admin-chart-title">Lượng truy cập hệ thống</h2>
            <div className="admin-chart-controls">
              <button
                type="button"
                className="admin-chart-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Làm mới"
              >
                <RefreshCw size={16} style={{ animation: refreshing ? "spin 0.6s linear" : "none" }} />
              </button>
              <button
                type="button"
                className="admin-chart-btn"
                onClick={handleZoomIn}
                title="Phóng to"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="admin-chart-btn"
                onClick={handleZoomOut}
                title="Thu nhỏ"
              >
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          <div className="admin-chart-wrapper" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}>
            <ResponsiveContainer width={500} height={300}>
              <LineChart data={CHART_DATA} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f3" />
                <XAxis
                  dataKey="day"
                  stroke="#9bb0ab"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#9bb0ab"
                  style={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5eae9",
                    borderRadius: 8,
                  }}
                  cursor={{ stroke: "#0f766e", strokeDasharray: "5 5" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#0f766e"
                  dot={{ fill: "#0f766e", r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA panel */}
        <div className="admin-cta-panel">
          <h3 className="admin-cta-title">Tạo địa điểm mới?</h3>
          <p className="admin-cta-desc">
            Thêm các điểm tham quan, nhà hàng hoặc cửa hàng mới vào hệ thống quản lý của bạn.
          </p>
          <Link href="/admin/pois" className="btn btn--outline">
            <Plus size={16} />
            Tạo POI mới
          </Link>
        </div>
      </div>

      {/* ── FAB button ──────────────────────────────────────────────────────── */}
        <Link href="/admin/pois" className="admin-fab">
          <Plus size={20} />
        </Link>

        <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      </section>
    </AdminLayout>
  );
}
