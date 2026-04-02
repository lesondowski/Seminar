export default function Modal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-md">
        <p>{message}</p>
        <button onClick={onClose} className="mt-2 bg-red-500 text-white p-2 rounded">Đóng</button>
      </div>
    </div>
  );
}