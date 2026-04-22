'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#programs',     label: 'Programs' },
  { href: '#services',     label: 'Services' },
  { href: '#universities', label: 'Universities' },
  { href: '#contact',      label: 'Contact' },
];

const TOOLS = [
  { href: '/brochure', icon: '📄', label: 'Brochure Generator' },
  { href: '/poster',   icon: '🎨', label: 'Poster Generator' },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [toolsOpen,   setToolsOpen]   = useState(false);
  const toolsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close tools dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
          <Image src="/images/logo/ilmora-white.png" alt="ILMORA Education" width={120} height={36} priority />
        </Link>

        {/* Desktop nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className={styles.navLink}>{l.label}</a>
          ))}

          {/* Tools dropdown */}
          <div className={styles.dropdownWrap} ref={toolsRef}>
            <button
              className={styles.navLink}
              onClick={() => setToolsOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={toolsOpen}
            >
              Tools <span style={{ fontSize: '0.6rem' }}>▾</span>
            </button>
            {toolsOpen && (
              <div className={styles.dropdown} role="menu">
                {TOOLS.map(t => (
                  <Link key={t.href} href={t.href} className={styles.dropdownItem}
                    role="menuitem" onClick={() => setToolsOpen(false)}>
                    <span>{t.icon}</span> {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* CTA group */}
        <div className={styles.actions}>
          <Link href="/login"            className={styles.btnStudent}>🎓 Student</Link>
          <Link href="/login?role=admin" className={styles.btnAdmin}>🔐 Admin</Link>
          <a    href="#contact"          className="btn btn-primary btn-sm">Free Callback</a>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true">
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
            <hr className={styles.mobileDivider} />
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href} className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}>{t.icon} {t.label}</Link>
            ))}
            <hr className={styles.mobileDivider} />
            <Link href="/login"            className="btn btn-secondary btn-full" onClick={() => setMobileOpen(false)}>🎓 Student Login</Link>
            <Link href="/login?role=admin" className="btn btn-ghost btn-full"     onClick={() => setMobileOpen(false)}>🔐 Admin Login</Link>
            <a    href="#contact"          className="btn btn-primary btn-full"   onClick={() => setMobileOpen(false)}>📞 Free Callback</a>
          </nav>
        </div>
      )}
    </header>
  );
}
