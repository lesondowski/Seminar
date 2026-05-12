import { useState } from "react";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";

export default function AdminTourEditor({ tour, allPois, onSave, onCancel }) {
  const [data, setData] = useState({
    id: tour.id,
    name: tour.name || "",
    poi_ids: tour.poi_ids ? [...tour.poi_ids] : [],
  });

  function moveUp(idx) {
    if (idx === 0) return;
    const ids = [...data.poi_ids];
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    setData({ ...data, poi_ids: ids });
  }

  function moveDown(idx) {
    if (idx >= data.poi_ids.length - 1) return;
    const ids = [...data.poi_ids];
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    setData({ ...data, poi_ids: ids });
  }

  function removePoi(id) {
    setData({ ...data, poi_ids: data.poi_ids.filter((p) => p !== id) });
  }

  function addPoi(e) {
    const id = Number(e.target.value);
    if (id && !data.poi_ids.includes(id)) {
      setData({ ...data, poi_ids: [...data.poi_ids, id] });
    }
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(data);
  }

  const poiMap = Object.fromEntries((allPois || []).map((p) => [p.id, p]));

  return (
    <section className="admin-section">
      <h2>{tour.id ? `Edit Tour #${tour.id}` : "Create Tour"}</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Tour Name
          <input
            className="field"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
        </label>

        <div>
          <label>Them POI</label>
          <select className="field" onChange={addPoi}>
            <option value="">-- chon POI --</option>
            {(allPois || []).filter((p) => !data.poi_ids.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <ul className="tour-poi-order">
          {data.poi_ids.map((id, idx) => (
            <li key={id} className="tour-poi-order-item">
              <span className="tour-poi-order-num">{idx + 1}</span>
              <span>{poiMap[id]?.name || `POI #${id}`}</span>
              <div className="tour-poi-order-actions">
                <button type="button" className="icon-btn" onClick={() => moveUp(idx)} disabled={idx === 0}><ArrowUp size={14} /></button>
                <button type="button" className="icon-btn" onClick={() => moveDown(idx)} disabled={idx >= data.poi_ids.length - 1}><ArrowDown size={14} /></button>
                <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePoi(id)}><Trash size={14} /></button>
              </div>
            </li>
          ))}
        </ul>

        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">Save</button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
