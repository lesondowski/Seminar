import { useState } from "react";

const LANGUAGES = ["vi", "en"];

export default function AdminPOIEditor({ poi, onSave, onCancel }) {
  const [data, setData] = useState({
    id: poi.id,
    lat: poi.lat || "",
    lng: poi.lng || "",
    trigger_radius: poi.trigger_radius || 5,
    translations: LANGUAGES.map((lang) => {
      const existing = poi.translations?.find((t) => t.language === lang);
      return {
        language: lang,
        name: existing?.name || "",
        description: existing?.description || "",
        audio_url: existing?.audio_url || "",
      };
    }),
  });

  function update(field, value) {
    setData({ ...data, [field]: value });
  }

  function updateTranslation(lang, field, value) {
    setData({
      ...data,
      translations: data.translations.map((t) =>
        t.language === lang ? { ...t, [field]: value } : t
      ),
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(data);
  }

  return (
    <section className="admin-section">
      <h2>{poi.id ? `Edit POI #${poi.id}` : "Create POI"}</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label>
            Lat
            <input className="field" value={data.lat} onChange={(e) => update("lat", e.target.value)} required />
          </label>
          <label>
            Lng
            <input className="field" value={data.lng} onChange={(e) => update("lng", e.target.value)} required />
          </label>
          <label>
            Trigger radius (m)
            <input className="field" type="number" value={data.trigger_radius} onChange={(e) => update("trigger_radius", e.target.value)} />
          </label>
        </div>

        {data.translations.map((t) => (
          <fieldset key={t.language} className="admin-fieldset">
            <legend>{t.language.toUpperCase()}</legend>
            <label>
              Name
              <input className="field" value={t.name} onChange={(e) => updateTranslation(t.language, "name", e.target.value)} />
            </label>
            <label>
              Description
              <textarea className="field" rows={3} value={t.description} onChange={(e) => updateTranslation(t.language, "description", e.target.value)} />
            </label>
            <label>
              Audio URL
              <input className="field" value={t.audio_url} onChange={(e) => updateTranslation(t.language, "audio_url", e.target.value)} />
            </label>
          </fieldset>
        ))}

        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">Save</button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
