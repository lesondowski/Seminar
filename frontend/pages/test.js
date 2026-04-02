import React from 'react';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">This is a test page to check routing.</p>
        <div className="space-y-2">
          <Link href="/" className="block text-blue-600 hover:text-blue-800">
            Go to Home
          </Link>
          <Link href="/auth/login" className="block text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}