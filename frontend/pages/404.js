import React from 'react';
import Navbar from '../components/common/Navbar';
import { ArrowLeftIcon } from '../components/common/Icons';

export default function Custom404() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#212121] mb-4">404</h1>
          <p className="text-2xl text-[#757575] mb-8">Trang không tìm thấy</p>
          <a href="/" className="bg-[#333333] text-white px-6 py-3 rounded hover:bg-[#444444]">
            <span className="inline-flex items-center gap-1"><ArrowLeftIcon className="w-4 h-4" />Quay lại trang chủ</span>
          </a>
        </div>
      </div>
    </>
  );
}
