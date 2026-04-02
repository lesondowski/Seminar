import { useState } from 'react';
import LoginForm from '../components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
      <div className="bg-[#FFFFFF] p-8 rounded shadow-md w-full max-w-md border border-[#DDDDDD]">
        <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h1>
        <LoginForm />
      </div>
    </div>
  );
}