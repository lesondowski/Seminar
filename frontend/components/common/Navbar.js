import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Only access localStorage after component mounts on client
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    setUserRole(role);
    setUserEmail(email || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userLanguage');
    localStorage.removeItem('userRole');
    router.push('/auth/login');
  };

  const toggleLanguage = () => {
    // Toggle language logic here
    console.log('Toggle language');
  };

  return (
    <nav className="bg-[#FFFFFF] text-[#212121] shadow-lg border-b border-[#DDDDDD] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🍜</span>
            <span className="text-[#000000]">Vĩnh Khánh Food Tour</span>
          </Link>

          {/* Desktop Navigation - Center (when user has role) */}
          {userRole && (
            <div className="hidden md:flex gap-6 items-center">
              <Link 
                href="/explorer/map" 
                className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]"
              >
                Khám phá
              </Link>
              <Link 
                href="/tour/tour-mode" 
                className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]"
              >
                Tour
              </Link>
            </div>
          )}

          {/* Desktop Menu - Right Side */}
          <div className="hidden md:flex gap-3 items-center">
            {!userRole ? (
              <Link 
                href="/auth/login" 
                className="px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition"
              >
                Đăng nhập
              </Link>
            ) : (
              <>
                {/* Language Button */}
                <button
                  onClick={toggleLanguage}
                  className="w-10 h-10 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full flex items-center justify-center transition text-[#212121] border border-[#DDDDDD]"
                  title="Đổi ngôn ngữ"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </button>

                {/* Account Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="w-10 h-10 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full flex items-center justify-center transition text-[#212121] border border-[#DDDDDD]"
                    title="Tài khoản"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>

                  {/* Account Menu */}
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-lg shadow-xl py-2 z-50 border border-[#DDDDDD]">
                      <div className="px-4 py-2 border-b border-[#DDDDDD]">
                        <p className="text-sm text-[#757575]">Đăng nhập với</p>
                        <p className="text-sm font-semibold text-[#212121] truncate">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] transition"
                      >
                        📊 Admin Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#DC3545] hover:bg-[#FFF0F0] transition font-semibold"
                      >
                        🚪 Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {userRole && (
            <button
              className="md:hidden text-2xl text-[#212121] hover:text-[#333333]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && userRole && (
          <div className="md:hidden pb-4 border-t border-[#DDDDDD] space-y-2">
            <Link 
              href="/explorer/map" 
              className="block px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              Khám phá
            </Link>
            <Link 
              href="/tour/tour-mode" 
              className="block px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              Tour
            </Link>
            <button
              onClick={() => { toggleLanguage(); setMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition"
            >
              Đổi ngôn ngữ
            </button>
            <button
              onClick={() => { router.push('/admin/dashboard'); setMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 text-[#DC3545] hover:bg-[#FFF0F0] rounded font-semibold transition"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
