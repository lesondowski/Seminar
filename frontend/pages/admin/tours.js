import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminTourList from "@/components/admin/AdminTourList";
import AdminTourEditor from "@/components/admin/AdminTourEditor";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminTour,
  deleteAdminTour,
  getAdminTours,
  updateAdminTour,
} from "@/services/adminClient";

export default function AdminToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState([]);
  const [allPois, setAllPois] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadTours(token) {
    const response = await getAdminTours(token);
    setTours(response.data.tours || []);
    setAllPois(
      (response.data.pois || []).map((poi) => ({
        id: poi.id,
        name: poi.translations?.find((translation) => translation.language === "vi")?.name || `POI #${poi.id}`,
      }))
    );
  }

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    loadTours(token)
      .catch((err) => {
        setErrorMsg(err?.error?.message || "Khong the tai danh sach tour");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(tour) {
    const token = sessionStorage.getItem("adminToken");
    setSaving(true);
    setErrorMsg("");

    try {
      if (creatingNew) {
        await createAdminTour(tour, token);
        setSuccessMsg("Tour da duoc tao thanh cong");
      } else {
        await updateAdminTour(tour.id, tour, token);
        setSuccessMsg("Tour da cap nhat");
      }

      await loadTours(token);
      setEditing(null);
      setCreatingNew(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err?.error?.message || "Khong the luu tour");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const token = sessionStorage.getItem("adminToken");
    try {
      await deleteAdminTour(id, token);
      await loadTours(token);
      setSuccessMsg("Tour da xoa");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err?.error?.message || "Khong the xoa tour");
    }
  }

  if (editing || creatingNew) {
    return (
      <AdminLayout
        title={editing ? `Sửa Tour #${editing.id}` : "Tạo Tour mới"}
        subtitle="Quản trị hành trình tham quan"
      >
        <AdminTourEditor
          tour={editing || {}}
          allPois={allPois}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setCreatingNew(false); }}
          saving={saving}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Quản lý Tours"
      subtitle="Tạo và sắp xếp các tour từ toàn bộ POI hệ thống"
      action={(
        <button className="btn btn-primary" type="button" onClick={() => setCreatingNew(true)}>
          Tạo Tour
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
          <p>Đang tải danh sách tour</p>
        </div>
      ) : (
        <AdminTourList
          tours={tours}
          onEdit={(tour) => setEditing(tour)}
          onDelete={handleDelete}
          onCreateNew={() => setCreatingNew(true)}
        />
      )}
    </AdminLayout>
  );
}
