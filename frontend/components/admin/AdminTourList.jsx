import { Trash, Pencil, Plus } from "lucide-react";

export default function AdminTourList({ tours, onEdit, onDelete, onCreateNew }) {
  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2>Tours</h2>
        <button className="btn btn-primary" type="button" onClick={onCreateNew}>
          <Plus size={16} />
          Create Tour
        </button>
      </div>

      {tours.length === 0 && <p className="empty-note">Chua co tour nao</p>}

      <ul className="admin-list">
        {tours.map((tour) => (
          <li className="admin-list-item" key={tour.id}>
            <div>
              <strong>{tour.name}</strong>
              <span>{tour.poi_ids?.length || 0} POI</span>
            </div>
            <div className="admin-list-actions">
              <button className="icon-btn" type="button" onClick={() => onEdit(tour)}>
                <Pencil size={16} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                type="button"
                onClick={() => {
                  if (window.confirm(`Xoa tour ${tour.name}?`)) {
                    onDelete(tour.id);
                  }
                }}
              >
                <Trash size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
