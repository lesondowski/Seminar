export default function MockPayment({ onConfirm, loading }) {
  return (
    <section className="surface-card">
      <h2>Thanh toan mock</h2>
      <p>Ban nay yeu cau xac nhan thanh toan de kich hoat phien tham quan.</p>
      <button
        className="btn btn-primary"
        type="button"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Dang xu ly" : "Thanh toan"}
      </button>
    </section>
  );
}
