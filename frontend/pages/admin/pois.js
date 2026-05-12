import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminPOIList from "@/components/admin/AdminPOIList";
import AdminPOIEditor from "@/components/admin/AdminPOIEditor";
import AdminLayout from "@/components/admin/AdminLayout";
import ManagerQrModal from "@/components/manager/ManagerQrModal";
import {
  createAdminPoi,
  deleteAdminPoi,
  getAdminPois,
  publishAdminSite,
  updateAdminPoi,
} from "@/services/adminClient";

export default function AdminPoisPage() {
  const router = useRouter();
  const [pois, setPois] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrPoi, setQrPoi] = useState(null);

  async function loadPois(token) {
    const response = await getAdminPois(token);
    setPois(response.data.pois || []);
  }

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    loadPois(token)
      .catch((err) => {
        setErrorMsg(err?.error?.message || "Khong the tai danh sach POI");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(poi) {
    const token = sessionStorage.getItem("adminToken");
    setSaving(true);
    setErrorMsg("");

    try {
      if (creatingNew) {
        await createAdminPoi(poi, token);
        setSuccessMsg("POI da duoc tao thanh cong");
      } else {
        await updateAdminPoi(poi.id, poi, token);
        setSuccessMsg("POI da duoc cap nhat");
      }

      await loadPois(token);
      setEditing(null);
      setCreatingNew(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err?.error?.message || "Khong the luu POI");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const token = sessionStorage.getItem("adminToken");
    try {
      await deleteAdminPoi(id, token);
      await loadPois(token);
      setSuccessMsg("POI da xoa");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err?.error?.message || "Khong the xoa POI");
    }
  }

  async function handlePublish() {
    const token = sessionStorage.getItem("adminToken");
    setSaving(true);
    setErrorMsg("");
    try {
      await publishAdminSite(token);
      setSuccessMsg("Publish thanh cong!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err?.error?.message || "Khong the publish");
    } finally {
      setSaving(false);
    }
  }

  if (editing || creatingNew) {
    return (
      <AdminLayout
        title={editing ? `Sửa POI #${editing.id}` : "Tạo POI mới"}
        subtitle="Quản trị POI hệ thống"
      >
        <AdminPOIEditor
          poi={editing || {}}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setCreatingNew(false); }}
          saving={saving}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Quản lý POI"
      subtitle="Xem và chỉnh sửa toàn bộ POI trên hệ thống"
      action={(
        <button
          className="btn btn-primary admin-publish-btn"
          type="button"
          onClick={handlePublish}
          disabled={saving || loading}
        >
          {saving ? "Đang xử lý" : "Publish All"}
        </button>
      )}
    >
      {successMsg && (
        <div className="status-banner status-banner--success">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="status-banner status-banner--error">{errorMsg}</div>
      )}

      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Đang tải danh sách POI</p>
        </div>
      ) : (
        <AdminPOIList
          pois={pois}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          page={page}
          onPageChange={setPage}
          onEdit={(poi) => setEditing(poi)}
          onDelete={handleDelete}
          onCreateNew={() => setCreatingNew(true)}
          onQr={(poi) => setQrPoi(poi)}
        />
      )}

      <ManagerQrModal poi={qrPoi} onClose={() => setQrPoi(null)} />
    </AdminLayout>
  );
}
