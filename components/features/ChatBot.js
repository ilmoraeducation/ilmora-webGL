'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { SITE, PROGRAMS, FAQS } from '@/lib/constants';
import styles from './ChatBot.module.css';

const QUICK_REPLIES = ['Tell me about programs','UAE Equivalency','Fees & Payment','How to Enroll','Contact ILMORA'];

const KB = [
  { triggers:['hello','hi','hey','salam','salaam'], answer:`👋 Hello! Welcome to **ILMORA Education**. I'm your virtual advisor.\n\nAsk me about:\n• Programs & Courses\n• UAE Equivalency\n• Fees & Admissions\n• Certificate Attestation` },
  { triggers:['program','course','degree','ug','pg','phd','btech','mtech','bachelor','master','mba','mca','bca','bba'], answer:`🎓 **ILMORA Programs**\n\n• **UG (Bachelor)** — BA, BCom, BSc, BCA, BBA\n• **PG (Master)** — MA, MCom, MSc, MBA, MCA\n• **BTech / MTech** — With UAE Equivalency support\n• **PhD** — Research-based doctoral programs\n• **Certifications** — Short professional courses\n• **UAE Equivalency** — Full process handled by us\n\nAll degrees from UGC-recognized, NAAC-accredited universities!` },
  { triggers:['fee','cost','price','afford','payment','cheap','expensive'], answer:`💰 **Fees at ILMORA**\n\nOur programs are significantly more affordable than traditional universities:\n\n• Flexible monthly payment plans\n• No hidden costs\n• Transparent pricing from day one\n\nContact us for exact pricing:\n📞 **${SITE.phone.uae}**` },
  { triggers:['equivalency','uae','mohe','hec','recognition','recognize','equivalent'], answer:`🇦🇪 **UAE Equivalency Support**\n\nILMORA's biggest specialty — we handle 100%:\n\n✅ MOHE submission\n✅ HEC verification\n✅ All documentation\n✅ Follow-ups & tracking\n✅ Certificate delivery\n\nYou provide documents — we handle everything else!` },
  { triggers:['attest','attestation','document','paperwork','mea','embassy'], answer:`📋 **Certificate Attestation**\n\nILMORA manages the full chain:\n\n1️⃣ University attestation\n2️⃣ State HRD attestation\n3️⃣ MEA attestation\n4️⃣ UAE Embassy attestation\n5️⃣ MOFA UAE (if needed)\n\nWe handle every single step!` },
  { triggers:['work','job','professional','weekend','flexible','online','leave'], answer:`💼 **Study While Working**\n\nYes — ILMORA is built for working professionals:\n\n• Weekend classes available\n• Flexible online schedule\n• Assignment & exam support\n• No need to take leave from work\n\nThousands of UAE professionals have graduated without disrupting their careers!` },
  { triggers:['duration','long','time','year','month','complete','finish','fast'], answer:`⏱️ **Program Duration**\n\n• **UG Degrees** — 3 years\n• **PG Programs** — 1–2 years\n• **PhD** — 2–4 years\n• **Certifications** — 3–6 months\n\nIntensive programs designed to minimize duration without compromising quality.` },
  { triggers:['university','partner','naac','ugc','accredited','recognized','osgu','lingaya','arni','rntu','rgu'], answer:`🏛️ **Partner Universities**\n\nAll UGC-recognized & NAAC-accredited:\n\n• Om Sterling Global University (OSGU)\n• Jamia Urdu Aligarh\n• Lingaya's Vidyapeeth\n• Arni University\n• Rabindranath Tagore University (RNTU)\n• Rajiv Gandhi University (RGU)\n\nAll degrees accepted internationally including UAE!` },
  { triggers:['contact','phone','call','whatsapp','email','reach','speak','advisor'], answer:`📞 **Contact ILMORA**\n\n• **UAE:** ${SITE.phone.uae}\n• **India:** ${SITE.phone.india}\n• **Email:** ${SITE.email}\n• **Instagram:** @ilmora_education\n\n💬 [WhatsApp Us](${SITE.whatsapp})\n\nFREE consultation — no commitment!` },
  { triggers:['register','enroll','join','apply','admission','start','begin'], answer:`📝 **How to Enroll**\n\n1. Contact us for a FREE consultation\n2. Choose your program\n3. Submit your documents\n4. ILMORA handles university enrollment\n5. Classes begin!\n\n👉 Register at **/register** or call **${SITE.phone.uae}**` },
];

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const item of KB) {
    if (item.triggers.some(t => lower.includes(t))) return item.answer;
  }
  return `🤔 I'm not sure about that. For the best answer, contact our advisors directly:\n\n📞 **UAE:** ${SITE.phone.uae}\n📧 **Email:** ${SITE.email}\n\nOr use the quick reply buttons below!`;
}

function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br/>');
}

export default function ChatBot() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [pulse,   setPulse]   = useState(false);
  const [msgs, setMsgs] = useState([{
    from:'bot',
    text:`👋 Hi! I'm the **ILMORA Assistant**. Ask me anything about programs, fees, UAE equivalency, or admissions!`,
  }]);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, typing]);
  useEffect(() => { const t = setTimeout(() => setPulse(true), 3500); return () => clearTimeout(t); }, []);

  const send = useCallback(async (text) => {
    if (!text?.trim()) return;
    setMsgs(m => [...m, { from:'user', text }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    setMsgs(m => [...m, { from:'bot', text: getBotReply(text) }]);
    setTyping(false);
  }, []);

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <>
      {open && (
        <div className={styles.window} role="dialog" aria-label="ILMORA Chat Assistant">
          <div className={styles.header}>
            <div className={styles.avatar}>🎓</div>
            <div>
              <div className={styles.name}>ILMORA Assistant</div>
              <div className={styles.status}><span className={styles.dot} />Online</div>
            </div>
            <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className={styles.messages}>
            {msgs.map((m, i) => (
              <div key={i} className={`${styles.msg} ${styles[m.from]}`}>
                {m.from === 'bot' && <div className={styles.msgAvatar}>🎓</div>}
                <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: formatMsg(m.text) }} />
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.bot}`}>
                <div className={styles.msgAvatar}>🎓</div>
                <div className={`${styles.bubble} ${styles.typingBubble}`}>
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.quickReplies}>
            {QUICK_REPLIES.map(q => (
              <button key={q} className={styles.quickBtn} onClick={() => send(q)}>{q}</button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Ask about programs, fees, UAE equivalency…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              aria-label="Chat message"
            />
            <button className={styles.sendBtn} onClick={() => send(input)} aria-label="Send">→</button>
          </div>
        </div>
      )}

      <button
        className={`${styles.fab} ${pulse && !open ? styles.pulse : ''}`}
        onClick={() => { setOpen(o => !o); setPulse(false); }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '✕' : '💬'}
        {!open && <span className={styles.fabLabel}>Chat</span>}
      </button>
    </>
  );
}
