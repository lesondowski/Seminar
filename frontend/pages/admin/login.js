import { useState } from "react";
import { useRouter } from "next/router";
import { loginAdmin } from "@/services/adminClient";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginAdmin(form);
      sessionStorage.setItem("adminToken", response.data.access_token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err?.error?.message || "Sai ten dang nhap hoac mat khau");
    }

    setLoading(false);
  }

  return (
    <main className="admin-login-shell">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h1>Admin Login</h1>

        {error && (
          <div className="status-banner status-banner--error">{error}</div>
        )}

        <label>
          Username
          <input
            className="field"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            className="field"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Dang dang nhap" : "Dang nhap"}
        </button>
      </form>
    </main>
  );
}
