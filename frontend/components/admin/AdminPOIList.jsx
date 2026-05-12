import { ChevronLeft, ChevronRight, Circle, MapPin, Pencil, Plus, QrCode, Search, Trash2 } from "lucide-react";

const PAGE_SIZE = 6;

export default function AdminPOIList({
  pois,
  query,
  onQueryChange,
  page,
  onPageChange,
  onEdit,
  onDelete,
  onCreateNew,
  onQr,
}) {
  const filtered = pois.filter((poi) => {
    const name = poi.translations?.[0]?.name || `POI #${poi.id}`;
    const searchTarget = [name, poi.lat, poi.lng, poi.trigger_radius, ...(poi.translations || []).map((t) => t.language)]
      .join(" ")
      .toLowerCase();
    return !query || searchTarget.includes(query.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2>Toàn bộ POI trên hệ thống</h2>
        <button className="btn btn-primary" type="button" onClick={onCreateNew}>
          <Plus size={16} />
          Tạo POI
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-search">
          <Search size={15} className="admin-card-search-icon" />
          <input
            className="admin-card-search-input"
            placeholder="Tìm POI theo tên, tọa độ hoặc ngôn ngữ..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty-note">Chưa có POI phù hợp</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>POI</th>
                <th>Tọa độ</th>
                <th>Bán kính</th>
                <th>Ngôn ngữ</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((poi) => {
                const name = poi.translations?.[0]?.name || `POI #${poi.id}`;
                const languageCount = poi.translations?.length || 0;
                return (
                  <tr key={poi.id}>
                    <td>
                      <div className="admin-table-poi">
                        <span className="admin-table-poi-icon">
                          <MapPin size={16} />
                        </span>
                        <div>
                          <strong>{name}</strong>
                          <span>POI #{poi.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-mono">
                      {poi.lat}, {poi.lng}
                    </td>
                    <td>{poi.trigger_radius}m</td>
                    <td>
                      <span className="admin-pill">
                        <Circle size={6} style={{ fill: "currentColor" }} />
                        {languageCount} bản dịch
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        {onQr && (
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label="Lấy mã QR"
                            onClick={() => onQr(poi)}
                          >
                            <QrCode size={16} />
                          </button>
                        )}
                        <button className="icon-btn" type="button" aria-label="Sửa" onClick={() => onEdit(poi)}>
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn--danger"
                          type="button"
                          aria-label="Xoá"
                          onClick={() => {
                            if (window.confirm(`Xoá POI #${poi.id}?`)) onDelete(poi.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="admin-pagination">
          <span className="admin-pagination-info">
            Hiển thị {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} đến {Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
          <div className="admin-pagination-pages">
            <button className="admin-page-btn" disabled={safePage <= 1} type="button" onClick={() => onPageChange((p) => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                className={`admin-page-btn${item === safePage ? " admin-page-btn--active" : ""}`}
                type="button"
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ))}
            <button className="admin-page-btn" disabled={safePage >= totalPages} type="button" onClick={() => onPageChange((p) => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
