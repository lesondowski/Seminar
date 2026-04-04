import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../../utils/i18n/LanguageContext';
import { NoodleBowlIcon, CheckIcon, MenuIcon } from './Icons';

const LANG_OPTIONS = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
];

export default function Navbar() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
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

  const currentLang = LANG_OPTIONS.find(l => l.value === language) || LANG_OPTIONS[0];
  const canAccessAdmin = userRole === 'admin' || userRole === 'moderator';

  return (
    <nav className="bg-[#FFFFFF] text-[#212121] shadow-lg border-b border-[#DDDDDD] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2 hover:opacity-80 transition">
            <NoodleBowlIcon className="w-7 h-7 text-[#000000]" />
            <span className="text-[#000000]">Vĩnh Khánh Food Tour</span>
          </Link>

          {/* Desktop Nav - Center */}
          {userRole && (
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/explorer/map" className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]">
                {t('nav_explore')}
              </Link>
              <Link href="/tour/tour-mode" className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]">
                {t('nav_tour')}
              </Link>
              {canAccessAdmin && (
                <Link href="/admin/dashboard" className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]">
                  {t('nav_admin')}
                </Link>
              )}
              <Link href="" className="text-[#212121] hover:text-[#333333] font-medium transition border-b-2 border-transparent hover:border-[#333333]">
                {t('nav_qr')}
              </Link>
            </div>
          )}

          {/* Desktop Right */}
          <div className="hidden md:flex gap-3 items-center">
            {!userRole ? (
              <Link href="/auth/login" className="px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition">
                {t('nav_login')}
              </Link>
            ) : (
              <>
                {/* Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setShowLangMenu(!showLangMenu); setShowAccountMenu(false); }}
                    className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full flex items-center gap-2 transition text-[#212121] border border-[#DDDDDD]"
                    title={t('nav_account')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span className="text-xs font-semibold">{currentLang.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </button>
                  {showLangMenu && (
                    <div className="absolute right-0 mt-2 w-36 bg-[#FFFFFF] rounded-lg shadow-xl py-1 z-50 border border-[#DDDDDD]">
                      {LANG_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { changeLanguage(opt.value); setShowLangMenu(false); }}
                          className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition hover:bg-[#F5F5F5] ${language === opt.value ? 'font-bold text-[#212121]' : 'text-[#555555]'}`}
                        >
                          <span>{opt.label}</span>
                          {language === opt.value && <CheckIcon className="ml-auto w-4 h-4 text-green-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowAccountMenu(!showAccountMenu); setShowLangMenu(false); }}
                    className="w-10 h-10 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full flex items-center justify-center transition text-[#212121] border border-[#DDDDDD]"
                    title={t('nav_account')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-lg shadow-xl py-2 z-50 border border-[#DDDDDD]">
                      <div className="px-4 py-2 border-b border-[#DDDDDD]">
                        <p className="text-sm text-[#757575]">{t('nav_login_with')}</p>
                        <p className="text-sm font-semibold text-[#212121] truncate">{userEmail}</p>
                      </div>
                      {canAccessAdmin && (
                        <button
                          onClick={() => { router.push('/admin/dashboard'); setShowAccountMenu(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] transition"
                        >
                          {t('nav_admin')}
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#DC3545] hover:bg-[#FFF0F0] transition font-semibold"
                      >
                        {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {userRole && (
            <button className="md:hidden text-2xl text-[#212121] hover:text-[#333333]" onClick={() => setMenuOpen(!menuOpen)}>
              <MenuIcon className="w-7 h-7" />
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && userRole && (
          <div className="md:hidden pb-4 border-t border-[#DDDDDD] space-y-1">
            <Link href="/explorer/map" className="block px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition" onClick={() => setMenuOpen(false)}>
              {t('nav_explore')}
            </Link>
            <Link href="/tour/tour-mode" className="block px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition" onClick={() => setMenuOpen(false)}>
              {t('nav_tour')}
            </Link>
            {/* Language options in mobile */}
            <div className="px-4 py-2 border-t border-[#EEEEEE]">
              <p className="text-xs text-[#999] mb-1">Ngôn ngữ / Language</p>
              <div className="flex gap-2">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { changeLanguage(opt.value); setMenuOpen(false); }}
                    className={`px-3 py-1 rounded-full text-sm border transition ${language === opt.value ? 'bg-[#212121] text-white border-[#212121]' : 'bg-white text-[#212121] border-[#DDDDDD] hover:bg-[#F5F5F5]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {canAccessAdmin && (
              <button onClick={() => { router.push('/admin/dashboard'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-[#212121] hover:bg-[#F5F5F5] rounded transition">
                {t('nav_admin')}
              </button>
            )}
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-[#DC3545] hover:bg-[#FFF0F0] rounded font-semibold transition">
              {t('nav_logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
