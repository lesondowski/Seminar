import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Circle,
  QrCode,
} from "lucide-react";
import ManagerLayout from "@/components/manager/ManagerLayout";
import ManagerQrModal from "@/components/manager/ManagerQrModal";
import { managerMockClient } from "@/services/managerMockClient";

const PAGE_SIZE = 6;

const STATUS_LABEL = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
};
const STATUS_COLOR = {
  active: "mgr-chip--green",
  draft: "mgr-chip--gray-outline",
  inactive: "mgr-chip--gray",
};

export default function ManagerLocations() {
  const router = useRouter();
  const [pois, setPois] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [qrPoi, setQrPoi] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!sessionStorage.getItem("managerToken")) {
      router.replace("/manager/login");
      return;
    }

    managerMockClient
      .listPois()
      .then((data) => {
        if (cancelled) return;
        setPois(data || []);
      })
      .catch((err) => {
        if (cancelled) return;

        if (err?.error?.code === "UNAUTHORIZED" || err?.status === 401) {
          sessionStorage.removeItem("managerToken");
          sessionStorage.removeItem("managerDisplayName");
          router.replace("/manager/login");
          return;
        }

        setLoadError(err?.error?.message || "Không thể tải danh sách POI");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = pois.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.address || "").toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete(id) {
    if (!window.confirm("Xoá địa điểm này?")) return;
    setDeletingId(id);

    try {
      await managerMockClient.deletePoi(id);
      const updated = await managerMockClient.listPois();
      setPois(updated || []);
      setSuccessMsg("Đã xoá địa điểm");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      if (err?.error?.code === "UNAUTHORIZED" || err?.status === 401) {
        sessionStorage.removeItem("managerToken");
        sessionStorage.removeItem("managerDisplayName");
        router.replace("/manager/login");
        return;
      }
      setLoadError(err?.error?.message || "Không thể xoá địa điểm");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ManagerLayout searchPlaceholder="Search locations...">
      {/* Page title bar */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Locations Management</h1>
          <p className="mgr-page-sub">
            View and manage all points of interest within your business portfolio.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="mgr-btn mgr-btn--ghost" type="button">
            <Filter size={15} />
            Filter
          </button>
          <Link href="/manager/locations/new" className="mgr-btn mgr-btn--primary">
            <MapPin size={15} />
            Tạo POI mới
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="mgr-alert mgr-alert--success" style={{ marginBottom: 16 }}>
          {successMsg}
        </div>
      )}

      {loadError && (
        <div className="mgr-alert mgr-alert--error" style={{ marginBottom: 16 }}>
          {loadError}
        </div>
      )}

      {/* Table card */}
      <div className="mgr-card">
        {/* Search in-card */}
        <div className="mgr-card-search">
          <Search size={15} className="mgr-card-search-icon" />
          <input
            className="mgr-card-search-input"
            placeholder="Tìm địa điểm…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>

        {loading ? (
          <div className="mgr-loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            <table className="mgr-table mgr-table--locations">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="mgr-table-empty">
                      Không có địa điểm nào
                    </td>
                  </tr>
                )}
                {pageItems.map((poi) => (
                  <tr key={poi.id}>
                    <td>
                      <div className="mgr-table-thumb mgr-table-thumb--lg">
                        {poi.images?.[0] ? (
                          <img src={poi.images[0]} alt={poi.name} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="mgr-table-poi-name">{poi.name}</span>
                        <span className="mgr-table-poi-sub">
                          {poi.category}
                          {poi.rating ? ` • ${poi.rating} Rating` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="mgr-table-addr">{poi.address || "—"}</td>
                    <td>
                      <span className={`mgr-chip ${STATUS_COLOR[poi.status] || "mgr-chip--gray"}`}>
                        <Circle size={6} style={{ fill: "currentColor" }} />
                        {STATUS_LABEL[poi.status] || poi.status}
                      </span>
                    </td>
                    <td className="mgr-table-date">{poi.updated_at}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="mgr-icon-btn"
                          type="button"
                          aria-label="Lấy mã QR"
                          onClick={() => setQrPoi(poi)}
                          title="Lấy mã QR"
                        >
                          <QrCode size={16} />
                        </button>
                        <Link
                          href={`/manager/locations/${poi.id}`}
                          className="mgr-icon-btn"
                          aria-label="Sửa"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          className="mgr-icon-btn mgr-icon-btn--danger"
                          type="button"
                          aria-label="Xoá"
                          disabled={deletingId === poi.id}
                          onClick={() => handleDelete(poi.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mgr-pagination">
              <span className="mgr-pagination-info">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </span>
              <div className="mgr-pagination-pages">
                <button
                  className="mgr-page-btn"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`mgr-page-btn${n === safePage ? " mgr-page-btn--active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="mgr-page-btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ManagerQrModal poi={qrPoi} onClose={() => setQrPoi(null)} />
    </ManagerLayout>
  );
}
