import { useState } from "react";
import { useRouter } from "next/router";
import { MapPin, Eye, EyeOff } from "lucide-react";
import { managerMockClient } from "@/services/managerMockClient";

export default function ManagerLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await managerMockClient.login(form.username, form.password);
      sessionStorage.setItem("managerToken", data.access_token);
      sessionStorage.setItem("managerDisplayName", data.display_name);
      router.push("/manager/dashboard");
    } catch (err) {
      setError(err?.error?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mgr-login-shell">
      <form className="mgr-login-card" onSubmit={handleLogin}>
        {/* Logo */}
        <div className="mgr-login-logo">
          <MapPin size={22} />
          <span>POI Manager</span>
        </div>

        <h1 className="mgr-login-title">Đăng nhập</h1>
        <p className="mgr-login-subtitle">
          Quản lý địa điểm kinh doanh của bạn
        </p>

        {error && (
          <div className="mgr-alert mgr-alert--error">{error}</div>
        )}

        <label className="mgr-label">
          Tên đăng nhập
          <input
            className="mgr-field"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            placeholder="manager_a"
            required
          />
        </label>

        <label className="mgr-label">
          Mật khẩu
          <div className="mgr-field-icon-wrap">
            <input
              className="mgr-field"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              placeholder="demo"
              required
            />
            <button
              type="button"
              className="mgr-field-icon-btn"
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button
          className="mgr-btn mgr-btn--primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: 4 }}
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>

        <p className="mgr-login-hint">
          Demo: <code>manager_a</code> / <code>demo</code>
        </p>
      </form>
    </div>
  );
}
