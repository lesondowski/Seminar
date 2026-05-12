export default function AccessError({ title, message, onRetry, onReset }) {
  return (
    <section className="surface-card">
      <h2>{title || "Ma khong hop le"}</h2>
      <p>{message || "Vui long quet lai ma tai diem tham quan"}</p>
      <div className="surface-actions">
        <button className="btn btn-primary" onClick={onRetry} type="button">
          Thu lai
        </button>
        <button className="btn btn-secondary" onClick={onReset} type="button">
          Quay lai
        </button>
      </div>
    </section>
  );
}
