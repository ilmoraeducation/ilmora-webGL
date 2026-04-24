'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/constants';
import toast from 'react-hot-toast';
import styles from './poster.module.css';

const TEMPLATES = [
  { id:'gold',    name:'Gold Luxury',       bg:'linear-gradient(145deg,#0D0D0D,#1a1200,#0D0D0D)', accent:'#C9A84C' },
  { id:'blue',    name:'Blue Professional', bg:'linear-gradient(145deg,#060d1f,#0a1628,#060d1f)', accent:'#4FC3F7' },
  { id:'minimal', name:'Dark Minimal',      bg:'linear-gradient(145deg,#111,#1a1a1a)',            accent:'#ffffff' },
  { id:'emerald', name:'Emerald Elite',     bg:'linear-gradient(145deg,#061208,#0d2016,#061208)', accent:'#4CAF50' },
];
const SIZES = [
  { label:'Instagram Post',  w:540, h:540,  ratio:'1:1' },
  { label:'Instagram Story', w:405, h:720,  ratio:'9:16' },
  { label:'Facebook Post',   w:600, h:315,  ratio:'~2:1' },
  { label:'A4 Print',        w:480, h:678,  ratio:'A4' },
];

export default function PosterPage() {
  const canvasRef  = useRef(null);
  const [tmpl,   setTmpl]   = useState(TEMPLATES[0]);
  const [size,   setSize]   = useState(SIZES[0]);
  const [form,   setForm]   = useState({ headline:'Get Your Degree.', sub:'We Handle the Rest.', programs:'MBA · BTech · MTech · PhD · BA · MA', badge:'UAE Equivalency Handled', contact:SITE.phone.uae, footer:`${SITE.email}  |  @ilmora_education`, showLogo:true, showBadge:true, showContact:true });
  const [downloading, setDownloading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = size.w, H = size.h;
    canvas.width = W; canvas.height = H;

    // Background
    const grad = ctx.createLinearGradient(0,0,W,H);
    const stops = tmpl.bg.match(/#[0-9a-fA-F]{6}/g) || ['#0D0D0D','#0D0D0D'];
    stops.forEach((c,i) => grad.addColorStop(i/(stops.length-1||1), c));
    ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

    // Side stripe
    const sg = ctx.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,tmpl.accent+'00'); sg.addColorStop(0.5,tmpl.accent); sg.addColorStop(1,tmpl.accent+'00');
    ctx.fillStyle = sg; ctx.fillRect(0,0,4,H);

    // Glow
    const glow = ctx.createRadialGradient(W,0,0,W,0,W*0.6);
    glow.addColorStop(0,tmpl.accent+'1a'); glow.addColorStop(1,'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

    const pad = Math.round(W*0.07);
    let y = Math.round(H*0.09);

    // Logo
    if (form.showLogo) {
      ctx.font = `900 ${Math.round(W*0.055)}px Arial Black,Arial,sans-serif`;
      ctx.fillStyle = tmpl.accent; ctx.fillText('ILMORA',pad,y);
      ctx.font = `400 ${Math.round(W*0.022)}px Arial,sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText('E D U C A T I O N',pad,y+Math.round(W*0.032));
      y += Math.round(W*0.065);
    }

    // Divider
    ctx.strokeStyle=tmpl.accent; ctx.globalAlpha=0.3; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
    ctx.globalAlpha=1; y+=Math.round(H*0.055);

    // Badge
    if (form.showBadge && form.badge) {
      ctx.font = `700 ${Math.round(W*0.028)}px Arial,sans-serif`;
      const bW = ctx.measureText(form.badge).width+Math.round(W*0.06);
      const bH = Math.round(W*0.055);
      ctx.fillStyle=tmpl.accent;
      // roundRect polyfill for older browsers
      const rx=4,bx=pad,by=y-bH*0.75;
      ctx.beginPath();
      ctx.moveTo(bx+rx,by); ctx.lineTo(bx+bW-rx,by); ctx.arcTo(bx+bW,by,bx+bW,by+rx,rx);
      ctx.lineTo(bx+bW,by+bH-rx); ctx.arcTo(bx+bW,by+bH,bx+bW-rx,by+bH,rx);
      ctx.lineTo(bx+rx,by+bH); ctx.arcTo(bx,by+bH,bx,by+bH-rx,rx);
      ctx.lineTo(bx,by+rx); ctx.arcTo(bx,by,bx+rx,by,rx);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle='#000'; ctx.fillText(form.badge,pad+Math.round(W*0.03),y);
      y+=Math.round(H*0.06);
    }

    // Headline
    ctx.font=`800 ${Math.round(W*0.085)}px Georgia,serif`; ctx.fillStyle='#fff';
    const hl=wrapText(ctx,form.headline,W-pad*2);
    hl.forEach(l=>{ctx.fillText(l,pad,y);y+=Math.round(W*0.095);});

    // Sub
    ctx.font=`700 ${Math.round(W*0.065)}px Georgia,serif`; ctx.fillStyle=tmpl.accent;
    const sl=wrapText(ctx,form.sub,W-pad*2);
    sl.forEach(l=>{ctx.fillText(l,pad,y);y+=Math.round(W*0.075);});

    y+=Math.round(H*0.02);

    // Programs
    if (form.programs) {
      ctx.font=`600 ${Math.round(W*0.032)}px Arial,sans-serif`; ctx.fillStyle='rgba(255,255,255,0.6)';
      wrapText(ctx,form.programs,W-pad*2).forEach(l=>{ctx.fillText(l,pad,y);y+=Math.round(W*0.042);});
    }

    // Contact
    if (form.showContact && form.contact) {
      const cY=H-Math.round(H*0.22);
      ctx.font=`700 ${Math.round(W*0.038)}px Arial,sans-serif`; ctx.fillStyle=tmpl.accent;
      ctx.fillText(form.contact,pad,cY);
      ctx.strokeStyle=tmpl.accent; ctx.globalAlpha=0.2; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad,cY+Math.round(W*0.02)); ctx.lineTo(W-pad,cY+Math.round(W*0.02)); ctx.stroke();
      ctx.globalAlpha=1;
      ctx.font=`400 ${Math.round(W*0.025)}px Arial,sans-serif`; ctx.fillStyle='rgba(255,255,255,0.35)';
      wrapText(ctx,form.footer,W-pad*2).forEach((l,i)=>ctx.fillText(l,pad,cY+Math.round(W*0.05)+i*Math.round(W*0.035)));
    }

    ctx.font=`400 ${Math.round(W*0.02)}px Arial,sans-serif`; ctx.fillStyle='rgba(255,255,255,0.1)';
    ctx.fillText(`© ${new Date().getFullYear()} ILMORA Education`,W-pad,H-Math.round(H*0.025),W-pad*2);
  }, [tmpl, form, size]);

  useEffect(() => { draw(); }, [draw]);

  function wrapText(ctx,text,maxW) {
    const words=text.split(' '), lines=[]; let curr='';
    words.forEach(w=>{ const t=curr?curr+' '+w:w; if(ctx.measureText(t).width>maxW&&curr){lines.push(curr);curr=w;}else curr=t; });
    if(curr)lines.push(curr); return lines;
  }

  async function download() {
    setDownloading(true);
    await new Promise(r=>setTimeout(r,200));
    try {
      const link=document.createElement('a');
      link.download=`ILMORA_Poster_${tmpl.name.replace(/\s+/g,'_')}.png`;
      link.href=canvasRef.current.toDataURL('image/png',1.0);
      link.click();
      toast.success('Poster downloaded! 🎨');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/"><Image src="/images/logo/ilmora-white.png" alt="ILMORA" width={100} height={30} /></Link>
        <div><h1 className={styles.pageTitle}>🎨 Poster Generator</h1><p className={styles.pageSub}>Create marketing posters — download as PNG</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:'0.65rem'}}>
          <Link href="/brochure" className="btn btn-ghost btn-sm">📄 Brochure</Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Home</Link>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.controls}>
          {/* Templates */}
          <div className={`card ${styles.controlCard}`}>
            <div className={styles.controlLabel}>🎨 Template</div>
            <div className={styles.tmplGrid}>
              {TEMPLATES.map(t=>(
                <button key={t.id} className={`${styles.tmplBtn} ${tmpl.id===t.id?styles.tmplActive:''}`}
                  onClick={()=>setTmpl(t)} style={{background:t.bg,borderColor:tmpl.id===t.id?t.accent:'transparent'}}>
                  <span style={{color:t.accent,fontWeight:700,fontSize:'0.73rem'}}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className={`card ${styles.controlCard}`}>
            <div className={styles.controlLabel}>📐 Size</div>
            <div className={styles.sizeGrid}>
              {SIZES.map(s=>(
                <button key={s.label} className={`${styles.sizeBtn} ${size.label===s.label?styles.sizeActive:''}`} onClick={()=>setSize(s)}>
                  <div className={styles.sizeLabelText}>{s.label}</div>
                  <div className={styles.sizeRatio}>{s.ratio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className={`card ${styles.controlCard}`}>
            <div className={styles.controlLabel}>✏️ Content</div>
            <div className={styles.formFields}>
              {[['Headline','headline','Get Your Degree.'],['Sub-headline','sub','We Handle the Rest.'],['Programs Line','programs','MBA · BTech · PhD…'],['Badge Text','badge','UAE Equivalency Handled'],['Contact','contact','+971 52 968 2123'],['Footer','footer','email | @handle']].map(([l,k,p])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" placeholder={p} value={form[k]} onChange={e=>set(k)(e.target.value)} />
                </div>
              ))}
              <div className={styles.toggleRow}>
                {[['Show Logo','showLogo'],['Show Badge','showBadge'],['Show Contact','showContact']].map(([l,k])=>(
                  <label key={k} className={styles.toggle}>
                    <input type="checkbox" checked={form[k]} onChange={e=>set(k)(e.target.checked)} />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={download} disabled={downloading}>
            {downloading?'⌛ Processing…':'📥 Download PNG Poster'}
          </button>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewLabel}>Live Preview</div>
          <div className={styles.canvasWrap}>
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>
          <p className={styles.sizeNote}>{size.label} — {size.w}×{size.h}px · High Quality PNG</p>
        </div>
      </div>
    </div>
  );
}
