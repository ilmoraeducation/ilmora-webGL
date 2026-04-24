'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PROGRAMS, SITE } from '@/lib/constants';
import toast from 'react-hot-toast';
import styles from './brochure.module.css';

export default function BrochurePage() {
  const [form, setForm] = useState({ studentName:'', phone:'', email:'', program:'', city:'', nationality:'' });
  const [generating, setGenerating] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const selectedProgram = PROGRAMS.find(p => p.title === form.program);

  async function generatePDF() {
    if (!form.studentName || !form.program) return toast.error('Please fill Student Name and select a Program');
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      const W = 210, H = 297;

      // Background
      doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F');
      // Gold stripe
      doc.setFillColor(201,168,76); doc.rect(0,0,6,H,'F');
      // Header area
      doc.setFillColor(20,20,30); doc.rect(6,0,W-6,55,'F');
      doc.setFillColor(201,168,76); doc.rect(6,55,W-6,0.8,'F');

      // Logo text
      doc.setFont('helvetica','bold'); doc.setFontSize(28); doc.setTextColor(201,168,76);
      doc.text('ILMORA',20,22);
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(180,180,180);
      doc.text('EDUCATION',20,30);
      doc.setFontSize(8); doc.setTextColor(120,120,120);
      doc.text(`UAE & India  ·  Premium Education Consultancy`,20,37);

      // Badge
      doc.setFillColor(201,168,76); doc.roundedRect(130,12,65,10,2,2,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(0,0,0);
      doc.text('PERSONALIZED BROCHURE',162.5,18.5,{align:'center'});

      // Date
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,100,100);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}`,162.5,30,{align:'center'});

      // Greeting
      let y = 75;
      doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.setTextColor(255,255,255);
      doc.text(`Dear ${form.studentName},`,20,y); y+=16;
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(160,160,160);
      const greetLines = doc.splitTextToSize('Thank you for your interest in ILMORA Education. We have prepared this personalized brochure to guide you through your academic journey with us.',W-40);
      doc.text(greetLines,20,y); y+=greetLines.length*6+8;

      // Program box
      doc.setFillColor(25,25,38); doc.roundedRect(14,y,W-28,65,4,4,'F');
      doc.setDrawColor(201,168,76); doc.setLineWidth(0.5); doc.roundedRect(14,y,W-28,65,4,4,'S');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(201,168,76);
      doc.text('YOUR SELECTED PROGRAM',20,y+12);
      doc.setFontSize(16); doc.setTextColor(255,255,255);
      const pl = doc.splitTextToSize(form.program,W-50);
      doc.text(pl,20,y+22);
      const details=[['Program Type',selectedProgram?.sub||'N/A'],['Mode','Weekend & Online'],['Category',selectedProgram?.id?.toUpperCase()||'N/A']];
      let dy=y+40; details.forEach(([l,v])=>{ doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(120,120,120);doc.text(l.toUpperCase(),20,dy);doc.setFont('helvetica','bold');doc.setTextColor(220,220,220);doc.setFontSize(9);doc.text(v,80,dy);dy+=8; });
      y+=72;

      // Benefits
      doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(255,255,255);
      doc.text('Why Choose ILMORA?',20,y); y+=8;
      doc.setFillColor(201,168,76); doc.rect(20,y,30,0.5,'F'); y+=8;
      const benefits=['UGC-Recognized, NAAC-Accredited university degrees','100% attestation & UAE equivalency handled by ILMORA','No need to quit your job — weekend & online classes','Dedicated advisor from enrollment to certification','Flexible monthly payment plans — no hidden costs'];
      benefits.forEach(b=>{ doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(201,168,76);doc.text('✓',20,y);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(180,180,180);doc.text(b,28,y);y+=8; });

      // Footer
      doc.setFillColor(20,20,30); doc.rect(6,H-30,W-6,30,'F');
      doc.setFillColor(201,168,76); doc.rect(6,H-30,W-6,0.5,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(201,168,76);
      doc.text('ILMORA Education — Contact Us',20,H-20);
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(140,140,140);
      doc.text(`📞 UAE: ${SITE.phone.uae}  |  📞 India: ${SITE.phone.india}`,20,H-13);
      doc.text(`✉ ${SITE.email}  |  @ilmora_education`,20,H-7);

      doc.save(`ILMORA_Brochure_${form.studentName.replace(/\s+/g,'_')}.pdf`);
      toast.success('Brochure downloaded! 🎓');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.logo}><Image src="/images/logo/ilmora-white.png" alt="ILMORA" width={100} height={30} /></Link>
        <div><h1 className={styles.pageTitle}>📄 Brochure Generator</h1><p className={styles.pageSub}>Create a personalized ILMORA brochure instantly</p></div>
        <Link href="/" className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>← Home</Link>
      </header>

      <div className={styles.layout}>
        <div className={`card ${styles.formPanel}`}>
          <h2 className={styles.panelTitle}>Student Information</h2>
          <div className={styles.form}>
            {[['studentName','Student Full Name *','text','Enter full name'],['phone','Phone Number','tel','+971 or +91'],['email','Email Address','email','email@example.com'],['city','City','text','Dubai, Mumbai…'],['nationality','Nationality','text','Indian, Pakistani…']].map(([k,l,t,p]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" type={t} placeholder={p} value={form[k]} onChange={set(k)} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Select Program *</label>
              <select className="form-input" value={form.program} onChange={set('program')}>
                <option value="">Choose a program…</option>
                {PROGRAMS.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </div>
          </div>
          {selectedProgram && (
            <div className={styles.programPreview}>
              <span className="badge-gold">{selectedProgram.sub}</span>
              <strong className={styles.previewName}>{selectedProgram.title}</strong>
              <p className={styles.previewDesc}>{selectedProgram.desc}</p>
            </div>
          )}
          <button className="btn btn-primary btn-full btn-lg" onClick={generatePDF} disabled={generating} style={{marginTop:'1.5rem'}}>
            {generating ? '⌛ Generating PDF…' : '📥 Download Personalized Brochure'}
          </button>
        </div>

        <div className={styles.previewPanel}>
          <h2 className={styles.panelTitle}>Brochure Preview</h2>
          <p className={styles.panelSub}>A4 dark luxury design with your details</p>
          <div className={styles.mockBrochure}>
            <div className={styles.mockHeader}>
              <div className={styles.mockStripe} />
              <div className={styles.mockHeaderContent}>
                <div className={styles.mockLogo}>ILMORA</div>
                <div className={styles.mockBadge}>PERSONALIZED BROCHURE</div>
              </div>
            </div>
            <div className={styles.mockBody}>
              <div className={styles.mockGreeting}>Dear <span style={{color:'var(--gold)'}}>{form.studentName||'Student Name'}</span>,</div>
              <div className={styles.mockLine} /><div className={`${styles.mockLine} ${styles.mockLineShort}`} />
              <div className={styles.mockBox}>
                <div className={styles.mockBoxLabel}>YOUR SELECTED PROGRAM</div>
                <div className={styles.mockBoxProgram}>{form.program||'Program Name'}</div>
                <div className={styles.mockBoxMeta}>{selectedProgram?.sub||'Type'} &nbsp;·&nbsp; Weekend & Online</div>
              </div>
              {['UGC-Recognized Degrees','UAE Equivalency Handled','Full Documentation Support','Weekend Classes Available'].map(b => (
                <div key={b} className={styles.mockBenefit}><span style={{color:'var(--gold)'}}>✓</span> {b}</div>
              ))}
            </div>
            <div className={styles.mockFooter}>
              <div style={{fontSize:'0.62rem',color:'var(--text-dim)'}}>📞 {SITE.phone.uae} | ✉ {SITE.email}</div>
            </div>
          </div>
          <div className={styles.features}>
            {['🎨 Dark luxury A4 design','📋 Auto-filled details','🏛️ University info included','📥 Instant PDF download'].map(f => (
              <div key={f} className={styles.featureTag}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
