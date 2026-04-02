import { useState } from 'react';
import Modal from './Modal';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('vi');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Email không hợp lệ. Vui lòng thử lại.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Redirect to map on success
      window.location.href = '/map';
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Đang tải...' : 'Đăng nhập'}
      </button>
      {error && <Modal message={error} onClose={() => setError('')} />}
    </form>
  );
}