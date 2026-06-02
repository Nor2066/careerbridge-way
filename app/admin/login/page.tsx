'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Wrong password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full p-2 border rounded"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button onClick={handleLogin} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Login
      </button>
    </div>
  );
}