'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user)    { router.replace('/login?role=admin'); return; }
    if (!isAdmin) { router.replace('/student');          return; }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <img src="/images/logo/ilmora-white.png" alt="ILMORA" style={{ height:48 }} />
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
        </div>
      </div>
    );
  }
  return children;
}

export function StudentGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user)   { router.replace('/login'); return; }
    if (isAdmin) { router.replace('/admin'); return; }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || isAdmin) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <img src="/images/logo/ilmora-white.png" alt="ILMORA" style={{ height:48 }} />
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
        </div>
      </div>
    );
  }
  return children;
}

export function PublicGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace(isAdmin ? '/admin' : '/student');
  }, [user, isAdmin, loading, router]);

  if (loading) return null;
  if (user) return null;
  return children;
}
