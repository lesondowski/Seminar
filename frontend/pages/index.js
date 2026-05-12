import Link from "next/link";
import { Compass, QrCode, Map, MapPin, Navigation } from "lucide-react";

export default function Home() {
  return (
    <main className="entry-shell">
      {/* Decorative floating badges */}
      <div className="entry-float entry-float--left" aria-hidden="true">
        <MapPin size={18} />
      </div>
      <div className="entry-float entry-float--right" aria-hidden="true">
        <Navigation size={18} />
      </div>

      <div className="entry-hero">
        {/* App logo */}
        <div className="entry-logo" aria-hidden="true">
          <Compass size={32} strokeWidth={1.8} />
        </div>

        {/* Heading */}
        <div className="entry-header">
          <h1 className="entry-title">GPS Visitor Experience</h1>
          <p className="entry-subtitle">
            Khám phá hành trình của bạn một cách thông minh.
          </p>
        </div>

        {/* Action cards */}
        <div className="entry-option-list">
          <Link className="entry-option" href="/app?mode=qr">
            <span className="entry-option-icon entry-option-icon--qr">
              <QrCode size={22} />
            </span>
            <span className="entry-option-text">
              <strong>Quét mã QR</strong>
              <span>Truy cập tức thì tại các điểm tham quan.</span>
            </span>
          </Link>

          <Link className="entry-option" href="/app?mode=home">
            <span className="entry-option-icon entry-option-icon--map">
              <Map size={22} />
            </span>
            <span className="entry-option-text">
              <strong>Vào trang chủ</strong>
              <span>Khám phá bản đồ và các tính năng thú vị.</span>
            </span>
          </Link>
        </div>

        {/* Admin link */}
        <Link className="entry-admin" href="/admin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Đăng nhập Quản trị viên
        </Link>
      </div>
    </main>
  );
}
