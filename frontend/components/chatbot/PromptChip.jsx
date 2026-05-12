export default function PromptChip({ label, onClick }) {
  return (
    <button className="prompt-chip" type="button" onClick={onClick}>
      {label}
    </button>
  );
}
