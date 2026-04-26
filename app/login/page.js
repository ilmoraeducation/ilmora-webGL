'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { PublicGuard } from '@/components/features/AuthGuard';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

function LoginForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const isAdmin      = params.get('role') === 'admin';
  const { login, resetPwd } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showReset,setShowReset]= useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // AuthProvider will re-render — redirect happens via middleware/layout
    } catch (err) {
      const map = {
        'auth/invalid-credential':   'Invalid email or password',
        'auth/user-not-found':        'No account with this email',
        'auth/wrong-password':        'Incorrect password',
        'auth/invalid-email':         'Invalid email address',
        'auth/too-many-requests':     'Too many attempts — try again later',
      };
      toast.error(map[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email) return toast.error('Enter your email first');
    try {
      await resetPwd(email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch {
      toast.error('Failed to send reset email.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Image src="/images/logo/ilmora-white.png" alt="ILMORA Education" width={120} height={36} priority />
        </Link>

        {/* Toggle */}
        <div className={styles.toggle} role="tablist">
          <Link href="/login"            role="tab" aria-selected={!isAdmin} className={`${styles.toggleBtn} ${!isAdmin ? styles.toggleActive : ''}`}>🎓 Student</Link>
          <Link href="/login?role=admin" role="tab" aria-selected={isAdmin}  className={`${styles.toggleBtn} ${isAdmin  ? styles.toggleActive : ''}`}>🔐 Admin</Link>
        </div>

        {!showReset ? (
          <>
            <h1 className={styles.title}>{isAdmin ? 'Admin Access' : 'Welcome Back'}</h1>
            <p className={styles.sub}>{isAdmin ? 'Sign in to your ILMORA Admin Dashboard' : 'Sign in to your student portal'}</p>

            <form onSubmit={handleLogin} className={styles.form} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="button" className={styles.forgotLink} onClick={() => setShowReset(true)}>
                Forgot password?
              </button>
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? '⌛ Signing In…' : isAdmin ? '🔐 Access Dashboard →' : '🎓 Sign In →'}
              </button>
            </form>

            {!isAdmin && (
              <p className={styles.switchText}>Don&apos;t have an account? <Link href="/register">Register here</Link></p>
            )}
            {isAdmin && (
              <p className={styles.adminNote}>Admin access is restricted to authorized ILMORA staff only.</p>
            )}
          </>
        ) : (
          <>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.sub}>Enter your email to receive a reset link</p>
            <form onSubmit={handleReset} className={styles.form} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <button className="btn btn-primary btn-full" type="submit">Send Reset Email</button>
            </form>
            <button className={styles.forgotLink} onClick={() => setShowReset(false)}>← Back to Login</button>
          </>
        )}

        <p className={styles.switchText} style={{ marginTop:'1rem' }}>
          <Link href="/">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicGuard>
      <Suspense>
        <LoginForm />
      </Suspense>
    </PublicGuard>
  );
}
