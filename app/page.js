'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ChatBot from '@/components/features/ChatBot';
import {
  UNIVERSITIES, PROGRAMS, SERVICES, STATS, FAQS,
  JOURNEY_STEPS, SITE, INTEREST_OPTIONS,
} from '@/lib/constants';
import styles from './page.module.css';

const Scene = dynamic(
  () => import('@/components/three/Scene'),
  { ssr: false, loading: () => null }
);

// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  // Hero refs
  const orbRef      = useRef(null);
  const badgeRef    = useRef(null);
  const titleRef    = useRef(null);
  const titleGoldRef= useRef(null);
  const subRef      = useRef(null);
  const btnsRef     = useRef(null);
  const pillsRef    = useRef(null);
  const scrollHintRef = useRef(null);
  const progressRef = useRef(null);
  const cursorRef   = useRef(null);
  const cursorRingRef = useRef(null);

  // UI state
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [formData, setFormData]   = useState({ name:'', phone:'', email:'', interest:'', message:'' });
  const [formSending, setFormSending] = useState(false);
  const [formDone, setFormDone]   = useState(false);

  // ── GSAP (loaded client-side only) ───────────────────────────────────────
  useEffect(() => {
    let cleanup;
    (async () => {
      const { gsap, ScrollTrigger } = await import('@/animations/gsap-init');
      const heroMod   = await import('@/animations/hero');
      const masterMod = await import('@/animations/masterTimeline');

      // Hero entrance + orb parallax
      // Lenis smooth scroll — scene-aware speed
      const lenisMod  = await import('@/animations/lenis');
      const cursorMod = await import('@/animations/cursor');
      const lenis = await lenisMod.initLenis();

      // Premium cursor
      const killCursor = cursorMod.initCursor(cursorRef.current, cursorRingRef.current);

      const heroCtx = heroMod.initHeroScene({
        badge: badgeRef, title: titleRef,
        titleGold: titleGoldRef, sub: subRef,
        btns: btnsRef, pills: pillsRef, scrollHint: scrollHintRef,
      });

      // Scroll progress bar
      masterMod.initScrollProgress(progressRef.current);

      // All 8 scenes
      masterMod.initProblemScene();
      masterMod.initChaosScene();
      masterMod.initRevealScene();
      masterMod.initProductScene();
      masterMod.initJourneyScene();
      masterMod.initTrustScene();
      masterMod.initCTAScene();
      masterMod.initNavbarScroll();
      masterMod.initRevealElements();
      masterMod.initSceneTransitions();

      cleanup = () => {
        heroCtx?.revert();
        killCursor?.();
        lenisMod.destroyLenis();
        masterMod.killAllTriggers();
      };
    })();

    return () => { if (cleanup) cleanup(); };
  }, []);

  // ── Custom cursor ─────────────────────────────────────────────────────────
  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = cursorRingRef.current;
    if (!cursor || !ring) return;
    let rx = 0, ry = 0, raf;
    const move = (e) => {
      cursor.style.left = e.clientX - 4 + 'px';
      cursor.style.top  = e.clientY - 4 + 'px';
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rx += (e.clientX - 17 - rx) * 0.14;
        ry += (e.clientY - 17 - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setFormSending(false);
    setFormDone(true);
    setFormData({ name:'', phone:'', email:'', interest:'', message:'' });
    setTimeout(() => setFormDone(false), 6000);
  }

  const set = k => e => setFormData(d => ({ ...d, [k]: e.target.value }));

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Fixed layers */}
      <Scene />
      <div className="cursor"      ref={cursorRef}      aria-hidden="true" />
      <div className="cursor-ring" ref={cursorRingRef}  aria-hidden="true" />
      <div className={styles.progress} ref={progressRef} aria-hidden="true" />

      <Navbar className="ilmora-navbar" />

      <main className={styles.main}>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 1 — HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-hero" className={styles.sceneHero}>
          <div className={styles.heroOverlay} aria-hidden="true" />

          {/* 3D orb rendered by HeroOrb.js WebGL canvas — see Scene.js */}

          <div className={`container hero-inner ${styles.heroContent}`}>
            <div ref={badgeRef} className={`badge-gold ${styles.heroBadge}`}>
              Premium Education Consultancy &nbsp;·&nbsp; UAE &amp; India
            </div>

            <h1 className={styles.heroTitle}>
              <span ref={titleRef}     className={styles.heroLine1}>Get Your Degree.</span>
              <span ref={titleGoldRef} className={`gradient-gold ${styles.heroLine2}`}>We Handle the Rest.</span>
            </h1>

            <p ref={subRef} className={`body-lg ${styles.heroSub}`}>
              Flexible UG, PG &amp; PhD programs for working professionals — with complete
              attestation, UAE equivalency, and documentation handled A to Z.
            </p>

            <div ref={btnsRef} className={styles.heroBtns}>
              <a href="#scene-product" className="btn btn-primary btn-lg">Explore Platform →</a>
              <a href="#scene-cta"     className="btn btn-secondary btn-lg">📞 Free Callback</a>
            </div>

            <div ref={pillsRef} className={styles.heroPills}>
              {['Authorized Universities','UAE Equivalency','Affordable Fees','Full Documentation'].map(b => (
                <span key={b} className={styles.pill}>
                  <span className={styles.pillCheck}>✓</span>{b}
                </span>
              ))}
            </div>

            <div ref={scrollHintRef} className={styles.scrollHint}>
              <span>Scroll</span>
              <div className={styles.scrollLine} />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 2 — PROBLEM
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-problem" className={`${styles.scene} ${styles.sceneProblem}`}>
          <div className="container">
            <div className={`section-label scene-label ${styles.sceneLabelEl}`}>The Challenge</div>
            <h2 className={styles.problemHeadline}>
              {['Working', 'professionals', 'deserve', 'better', 'than', 'broken', 'education', 'systems.'].map((w, i) => (
                <span key={i} className={`problem-word ${styles.problemWord}`}>{w}&nbsp;</span>
              ))}
            </h2>
            <div className={styles.problemLines}>
              {[
                'Degrees that take years — while you work full time.',
                'Paperwork no one guides you through.',
                'UAE equivalency that feels impossible.',
                'No one in your corner.',
              ].map((line, i) => (
                <div key={i} className={`problem-line ${styles.problemLine}`}>
                  <span className={styles.problemLineDash}>—</span> {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 3 — CHAOS
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-chaos" className={`${styles.scene} ${styles.sceneChaos}`}>
          <div className="container">
            <h2 className={`chaos-title ${styles.chaosTitle}`}>
              <span className="glitch-text">This is what it feels like.</span>
            </h2>
            <div className={styles.chaosGrid}>
              {[
                { icon:'📋', t:'Attestation',    d:'Which ministry? Which order? Which form?' },
                { icon:'🇦🇪', t:'UAE Equivalency', d:'6 months of follow-ups. No response.' },
                { icon:'🏛️', t:'University Docs', d:'Documents rejected. Start over.' },
                { icon:'⏳', t:'Lost Time',       d:'2 years in. No clear end.' },
                { icon:'💸', t:'Hidden Costs',    d:'Fees no one told you about.' },
                { icon:'🤷', t:'No Guidance',     d:'You\'re on your own.' },
              ].map((c, i) => (
                <div key={i} className={`card chaos-card ${styles.chaosCard}`}>
                  <span className={styles.chaosIcon}>{c.icon}</span>
                  <strong className={styles.chaosCardTitle}>{c.t}</strong>
                  <p className={styles.chaosCardDesc}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 4 — ILMORA REVEAL
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-reveal" className={`${styles.scene} ${styles.sceneReveal}`}>
          <div className={styles.revealCenter}>
            <div className={`reveal-glow ${styles.revealGlow}`} aria-hidden="true" />

            <div className={`reveal-logo ${styles.revealLogo}`}>
              <Image
                src="/images/logo/ilmora-white.png"
                alt="ILMORA Education"
                width={220} height={66}
                priority={false}
              />
            </div>

            <h2 className={styles.revealTagline}>
              {['Your', 'complete', 'education', 'partner.'].map((w, i) => (
                <span key={i} className={`reveal-tagline-word ${styles.revealWord}`}>{w}&nbsp;</span>
              ))}
            </h2>

            <p className={`reveal-sub ${styles.revealSub}`}>
              From enrollment to internationally recognized certification —<br/>
              ILMORA handles every single step. You just learn.
            </p>

            <a href="#scene-product" className={`btn btn-primary btn-lg reveal-cta ${styles.revealCta}`}>
              See How It Works →
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 5 — PRODUCT EXPERIENCE
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-product" className={`${styles.scene} ${styles.sceneProduct}`}>
          <div className="container">
            <div className={styles.productHeader}>
              <div className="section-label">The Platform</div>
              <h2 className={`product-title heading-lg ${styles.productTitle}`}>
                Built for <span className="gradient-gold">Working Professionals</span>
              </h2>
              <p className={`product-desc body-lg ${styles.productDesc}`}>
                Everything you need — student portal, advisor access, document tracking,
                certificate generation — in one premium platform.
              </p>
            </div>

            <div className={styles.productPanels}>
              {/* Panel 1 — Dashboard preview */}
              <div className={`card product-panel ${styles.productPanel} ${styles.productPanelLarge}`}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelDots}>
                    <span /><span /><span />
                  </div>
                  <span className={styles.panelTitle}>Student Dashboard</span>
                </div>
                <div className={styles.panelContent}>
                  <div className={styles.dashMockRow}>
                    {['Enrolled Courses','Documents','Status','Progress'].map((l,i) => (
                      <div key={l} className={styles.dashMockStat}>
                        <div className={styles.dashMockNum} style={{color: i===0?'var(--gold)':i===1?'#3b82f6':i===2?'var(--success)':'var(--warning)'}}>
                          {i===3?'0%':0}
                        </div>
                        <div className={styles.dashMockLabel}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.dashMockTimeline}>
                    {['Inquiry','Docs Submitted','Under Review','Enrolled'].map((s,i) => (
                      <div key={s} className={`${styles.dashMockStep} ${i===0?styles.stepActive:''}`}>
                        <div className={styles.dashMockDot}>{i===0?'●':'○'}</div>
                        <div className={styles.dashMockStepLabel}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel 2 — Brochure generator */}
              <div className={`card product-panel ${styles.productPanel}`}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelDots}><span /><span /><span /></div>
                  <span className={styles.panelTitle}>Brochure Generator</span>
                </div>
                <div className={styles.panelContent}>
                  <div className={styles.miniForm}>
                    <div className={styles.miniInput}>John Smith</div>
                    <div className={styles.miniInput}>MBA · Finance</div>
                    <div className={`${styles.miniBtn}`}>Generate PDF →</div>
                  </div>
                </div>
              </div>

              {/* Panel 3 — AI Chatbot */}
              <div className={`card product-panel ${styles.productPanel}`}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelDots}><span /><span /><span /></div>
                  <span className={styles.panelTitle}>AI Advisor</span>
                </div>
                <div className={styles.panelContent}>
                  <div className={styles.chatMock}>
                    <div className={`${styles.chatBubble} ${styles.chatBot}`}>How can I help you today?</div>
                    <div className={`${styles.chatBubble} ${styles.chatUser}`}>What about UAE equivalency?</div>
                    <div className={`${styles.chatBubble} ${styles.chatBot}`}>We handle 100% of the MOHE process for you.</div>
                  </div>
                </div>
              </div>

              {/* Panel 4 — Admin */}
              <div className={`card product-panel ${styles.productPanel}`}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelDots}><span /><span /><span /></div>
                  <span className={styles.panelTitle}>Admin Dashboard</span>
                </div>
                <div className={styles.panelContent}>
                  <div className={styles.adminMock}>
                    {['Students','Leads','Courses','Documents'].map((t,i) => (
                      <div key={t} className={styles.adminMockRow}>
                        <span>{t}</span>
                        <span className={styles.adminMockBadge}>{[24,12,8,36][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`gsap-reveal ${styles.productCTAs}`}>
              <Link href="/login"    className="btn btn-secondary">🎓 Student Portal</Link>
              <Link href="/login?role=admin" className="btn btn-ghost">🔐 Admin Access</Link>
              <Link href="/brochure" className="btn btn-ghost">📄 Brochure Tool</Link>
              <Link href="/poster"   className="btn btn-ghost">🎨 Poster Tool</Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 6 — JOURNEY
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-journey" className={`${styles.scene} ${styles.sceneJourney}`}>
          <div className="container">
            <div className={`section-label ${styles.sectionLabelCenter}`}>Your Journey</div>
            <h2 className={`journey-title heading-lg ${styles.journeyTitle}`}>
              Five Steps.<br/><span className="gradient-gold">One Goal.</span>
            </h2>

            <div className={styles.journeyTrack}>
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.n} className={`journey-step ${styles.journeyStep}`}>
                  <div className={styles.journeyNum}>{step.n}</div>
                  <strong className={styles.journeyStepTitle}>{step.title}</strong>
                  <p className={styles.journeyStepDesc}>{step.desc}</p>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <div className={`journey-connector ${styles.journeyConnector}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 7 — DATA + TRUST
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-trust" className={`${styles.scene} ${styles.sceneTrust}`}>
          <div className="container">
            <div className={`section-label ${styles.sectionLabelCenter}`}>By the Numbers</div>
            <h2 className={`trust-title heading-lg ${styles.trustTitle}`}>
              Results That <span className="gradient-gold">Speak.</span>
            </h2>

            {/* Animated counters */}
            <div className={styles.trustStats}>
              {STATS.map(s => (
                <div key={s.label} className={styles.trustStat}>
                  <div
                    className={`trust-counter ${styles.trustNum}`}
                    data-target={s.value}
                    data-suffix={s.suffix}
                  >0</div>
                  <div className={styles.trustLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className={styles.testimonials}>
              {[
                { name:'Ahmed Al-Rashidi', role:'Engineer, Dubai', text:'ILMORA handled my BTech equivalency from start to finish. 4 months. Zero stress.', stars:5 },
                { name:'Priya Nair',       role:'MBA Graduate, Abu Dhabi', text:'I studied on weekends while managing my full-time job. ILMORA made it possible.', stars:5 },
                { name:'Mohammed Farhan',  role:'IT Manager, Sharjah', text:'The attestation process alone would have taken me a year. ILMORA did it in 6 weeks.', stars:5 },
              ].map((t, i) => (
                <div key={i} className={`card trust-testimonial ${styles.testimonialCard}`}>
                  <div className={styles.testStars}>{'★'.repeat(t.stars)}</div>
                  <p className={styles.testText}>&quot;{t.text}&quot;</p>
                  <div className={styles.testAuthor}>
                    <div className={styles.testAvatar}>{t.name[0]}</div>
                    <div>
                      <strong className={styles.testName}>{t.name}</strong>
                      <div className={styles.testRole}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* University logos */}
            <div className={`gsap-reveal ${styles.uniStrip}`}>
              <div className={styles.uniStripLabel}>Our Partner Universities</div>
              <div className={styles.uniLogos}>
                {UNIVERSITIES.map(u => (
                  <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                    className={styles.uniLogoWrap} title={u.name}>
                    <Image src={u.img} alt={u.name} width={110} height={44}
                      style={{ objectFit:'contain', filter:'brightness(0.85) grayscale(0.2)' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 8 — CTA + CONTACT
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="scene-cta" className={`${styles.scene} ${styles.sceneCTA}`}>
          <div className={`cta-bg ${styles.ctaBg}`} aria-hidden="true" />
          <div className="container">
            <div className={styles.ctaInner}>
              <div className={styles.ctaLeft}>
                <h2 className={`cta-title heading-xl ${styles.ctaTitle}`}>
                  Your Degree.<br />
                  <span className="gradient-gold">Starts Today.</span>
                </h2>
                <p className={`cta-sub body-lg ${styles.ctaSub}`}>
                  Free consultation, no commitment. Our advisors will find the right
                  program for you and explain exactly how we handle everything.
                </p>
                <div className={styles.ctaContact}>
                  <a href={`tel:${SITE.phone.uae.replace(/\s/g,'')}`} className={`cta-btn btn btn-primary btn-lg ${styles.ctaBtn}`}>
                    📞 {SITE.phone.uae}
                  </a>
                  <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer"
                    className={`btn btn-lg ${styles.waBtn}`}>
                    💬 WhatsApp Us
                  </a>
                </div>
                <div className={styles.ctaMeta}>
                  <span>📞 India: {SITE.phone.india}</span>
                  <span>✉️ {SITE.email}</span>
                </div>
              </div>

              {/* Contact Form */}
              <div className={`card ${styles.ctaForm}`}>
                {formDone ? (
                  <div className={styles.formSuccess}>
                    <span className={styles.successIcon}>✅</span>
                    <h3 className="heading-md">Thank You!</h3>
                    <p className="body-md">Our advisor contacts you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h3 className={styles.formTitle}>Request a Free Callback</h3>
                    {[
                      { label:'Full Name *',    k:'name',  type:'text',  ph:'Your full name',     req:true },
                      { label:'Phone Number *', k:'phone', type:'tel',   ph:'+971 or +91 number', req:true },
                      { label:'Email Address',  k:'email', type:'email', ph:'your@email.com',      req:false },
                    ].map(f => (
                      <div key={f.k} className="form-group" style={{marginBottom:'0.9rem'}}>
                        <label className="form-label">{f.label}</label>
                        <input className="form-input" type={f.type} placeholder={f.ph}
                          value={formData[f.k]} required={f.req} onChange={set(f.k)} />
                      </div>
                    ))}
                    <div className="form-group" style={{marginBottom:'0.9rem'}}>
                      <label className="form-label">I&apos;m Interested In</label>
                      <select className="form-input" value={formData.interest} onChange={set('interest')}>
                        <option value="">Select a program…</option>
                        {INTEREST_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{marginBottom:'1.25rem'}}>
                      <label className="form-label">Message (Optional)</label>
                      <textarea className="form-input" rows={3} placeholder="Tell us about your situation…"
                        value={formData.message} onChange={set('message')} />
                    </div>
                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={formSending}>
                      {formSending ? '⌛ Submitting…' : '📞 Request Free Callback'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="faq" className={`${styles.scene} ${styles.sceneFAQ}`}>
          <div className="container">
            <div className={`gsap-reveal ${styles.sectionLabelCenter}`}>
              <div className="section-label">Common Questions</div>
              <h2 className="heading-lg">Everything You <span className="gradient-gold">Need to Know</span></h2>
              <div className="gold-line gold-line-center" />
            </div>
            <div className={styles.faqList}>
              {FAQS.map((faq, i) => (
                <div key={i}
                  className={`gsap-reveal card ${styles.faqItem} ${activeFAQ===i ? styles.faqOpen : ''}`}
                  onClick={() => setActiveFAQ(activeFAQ===i ? null : i)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key==='Enter' && setActiveFAQ(activeFAQ===i?null:i)}>
                  <div className={styles.faqQ}>
                    {faq.q}
                    <span className={styles.faqIcon}>{activeFAQ===i ? '−' : '+'}</span>
                  </div>
                  {activeFAQ===i && <p className={styles.faqA}>{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <Image src="/images/logo/ilmora-white.png" alt="ILMORA" width={110} height={34} style={{marginBottom:'1rem'}} />
              <p className="body-md" style={{maxWidth:'290px',marginBottom:'0.7rem'}}>
                Your complete A-to-Z career development partner. Flexible degrees, affordable fees, full documentation support.
              </p>
              <span className="label text-dim">UAE &amp; India · 25+ Countries</span>
              <div className={styles.footerSocial}>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className={styles.footerSocialIcon}>📷</a>
                <a href={SITE.whatsapp}  target="_blank" rel="noopener noreferrer" className={styles.footerSocialIcon}>💬</a>
                <a href={`mailto:${SITE.email}`}                                   className={styles.footerSocialIcon}>✉️</a>
              </div>
            </div>
            <div>
              <div className={styles.footerColHead}>Quick Links</div>
              <ul className={styles.footerLinks}>
                {['#scene-reveal:About','#scene-product:Platform','#scene-journey:Journey','#scene-trust:Results','#faq:FAQ','#scene-cta:Contact'].map(l => {
                  const [href,label] = l.split(':');
                  return <li key={href}><a href={href}>{label}</a></li>;
                })}
              </ul>
            </div>
            <div>
              <div className={styles.footerColHead}>Programs</div>
              <ul className={styles.footerLinks}>
                {PROGRAMS.map(p => <li key={p.id}><a href="#scene-cta">{p.title}</a></li>)}
              </ul>
            </div>
            <div>
              <div className={styles.footerColHead}>Contact</div>
              <ul className={styles.footerLinks}>
                <li><a href={`tel:${SITE.phone.uae.replace(/\s/g,'')}`}>{SITE.phone.uae} (UAE)</a></li>
                <li><a href={`tel:${SITE.phone.india.replace(/\s/g,'')}`}>{SITE.phone.india} (India)</a></li>
                <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
                <li><a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li>
              </ul>
              <Link href="/login" className="btn btn-primary btn-sm" style={{marginTop:'1.25rem',display:'inline-flex'}}>Student Login</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className="label text-dim">© 2025 ILMORA Education. All rights reserved.</span>
            <div style={{display:'flex',gap:'1.5rem'}}>
              <a href="#" className="label text-dim">Privacy Policy</a>
              <a href="#" className="label text-dim">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />
    </>
  );
}
