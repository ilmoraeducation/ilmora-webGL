'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { PublicGuard } from '@/components/features/AuthGuard';
import { INTEREST_OPTIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'', interest:'' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill all required fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      toast.success('Account created! Welcome to ILMORA 🎓');
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'Email already registered — please login',
        'auth/invalid-email':        'Invalid email address',
        'auth/weak-password':        'Password is too weak',
      };
      toast.error(map[err.code] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      <div className={`${styles.card} ${styles.cardWide}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/images/logo/ilmora-white.png" alt="ILMORA Education" width={120} height={36} priority />
        </Link>

        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.sub}>Join thousands of professionals advancing their careers with ILMORA</p>

        <form onSubmit={handleRegister} className={styles.form} noValidate>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className="form-input" type="tel" placeholder="+971 or +91 number" value={form.phone} onChange={set('phone')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label">Program of Interest</label>
            <select className="form-input" value={form.interest} onChange={set('interest')}>
              <option value="">Select a program…</option>
              {INTEREST_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? '⌛ Creating Account…' : '🎓 Create My Account →'}
          </button>
        </form>

        <p className={styles.switchText}>Already have an account? <Link href="/login">Sign in here</Link></p>
        <p className={styles.switchText}><Link href="/">← Back to website</Link></p>
      </div>
    </div>
    </PublicGuard>
  );
}