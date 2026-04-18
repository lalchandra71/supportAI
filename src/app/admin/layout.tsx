'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem('supportai_current_user');
    if (!userJson) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}