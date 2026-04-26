'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { StudentGuard } from '@/components/features/AuthGuard';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './student.module.css';

const TABS = [
  { id:'dashboard', icon:'🏠', label:'Dashboard' },
  { id:'courses',   icon:'📚', label:'Courses' },
  { id:'status',    icon:'📋', label:'Application' },
  { id:'documents', icon:'📂', label:'Documents' },
  { id:'profile',   icon:'👤', label:'Profile' },
];

const STATUS_STEPS = ['Inquiry','Documents Submitted','Under Review','Enrolled','In Progress','Completed'];
const DOC_TYPES    = ['Passport','Emirates ID','10th Certificate','12th Certificate','Degree Certificate','Experience Letter'];

function StudentDashboardInner() {
  const { user, logout } = useAuth();
  const [tab,          setTab]          = useState('dashboard');
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [editMode,     setEditMode]     = useState(false);
  const [editData,     setEditData]     = useState({});
  const [sideOpen,     setSideOpen]     = useState(false);
  const fileRefs = useRef({});

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDoc(doc(db,'users',user.uid));
      if (snap.exists()) setProfile({ id:snap.id, ...snap.data() });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  }, [user?.uid]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    try {
      await updateDoc(doc(db,'users',user.uid), { ...editData, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p, ...editData }));
      setEditMode(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('File too large (max 10MB)');
    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${user.uid}/${docType}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const newDoc = { type: docType, name: file.name, url, uploadedAt: new Date().toISOString() };
      const docs = [...(profile?.documents || []), newDoc];
      await updateDoc(doc(db,'users',user.uid), { documents: docs, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p, documents: docs }));
      toast.success(`${docType} uploaded!`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const appStatus  = profile?.applicationStatus || 'pending';
  const stepIndex  = STATUS_STEPS.findIndex(s => s.toLowerCase().replace(/\s/g,'_') === appStatus) || 0;
  const docs       = profile?.documents || [];

  if (loading) return <div className="loading-screen"><div className="loading-logo"><img src="/images/logo/ilmora-white.png" alt="ILMORA" style={{height:48}} /><div className="loading-bar"><div className="loading-bar-fill"/></div></div></div>;

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sideOpen ? styles.sideOpen : ''}`}>
        <div className={styles.sideHeader}>
          <Image src="/images/logo/ilmora-white.png" alt="ILMORA" width={100} height={30} />
          <button className={styles.sideClose} onClick={() => setSideOpen(false)}>✕</button>
        </div>
        <div className={styles.sideUser}>
          <div className={styles.sideAvatar}>{profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}</div>
          <div>
            <div className={styles.sideName}>{profile?.name || 'Student'}</div>
            <span className={`status status-${appStatus}`}>{appStatus}</span>
          </div>
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSideOpen(false); }}
              className={`${styles.sideLink} ${tab===t.id ? styles.sideLinkActive : ''}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div className={styles.sideMeta}>
          <Link href="/brochure" className="btn btn-secondary btn-sm" style={{textAlign:'center'}}>📄 Get Brochure</Link>
          <button onClick={logout} className="btn btn-danger btn-sm btn-full">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="dash-header">
          <button className={styles.hamburger} onClick={() => setSideOpen(true)}>☰</button>
          <h1 className={styles.pageTitle}>{TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}</h1>
          <div style={{marginLeft:'auto'}}>
            <Link href="/" className="btn btn-ghost btn-sm">🌐 Home</Link>
          </div>
        </header>

        <div className="dash-content">

          {/* DASHBOARD */}
          {tab==='dashboard' && (
            <div>
              <div className={styles.welcomeCard}>
                <div>
                  <h2 className={styles.welcomeTitle}>Welcome back, <span style={{color:'var(--gold)'}}>{profile?.name?.split(' ')[0] || 'Student'}</span> 👋</h2>
                  <p className="body-md">Track your academic journey and manage everything from here.</p>
                </div>
                <span className={`status status-${appStatus}`}>{appStatus}</span>
              </div>

              <div className={styles.statsGrid}>
                {[
                  { icon:'📚', val:profile?.enrolledCourses?.length||0, label:'Enrolled Courses', color:'var(--gold)' },
                  { icon:'📂', val:docs.length, label:'Documents', color:'#3b82f6' },
                  { icon:'🏆', val:0, label:'Certificates', color:'var(--success)' },
                  { icon:'📊', val:'0%', label:'Progress', color:'var(--warning)' },
                ].map(s => (
                  <div key={s.label} className={`card ${styles.dashStat}`}>
                    <div className={styles.dashStatIcon}>{s.icon}</div>
                    <div className={styles.dashStatVal} style={{color:s.color}}>{s.val}</div>
                    <div className={styles.dashStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Status progress */}
              <div className={`card ${styles.progressCard}`}>
                <h3 className={styles.cardTitle}>Application Status</h3>
                <div className={styles.progressSteps}>
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className={`${styles.progressStep} ${i <= stepIndex ? styles.stepDone : ''}`}>
                      <div className={styles.progressDot}>{i < stepIndex ? '✓' : i+1}</div>
                      <span className={styles.progressLabel}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className={styles.quickGrid}>
                {[
                  { icon:'📄', label:'Download Brochure', href:'/brochure' },
                  { icon:'🎨', label:'Create Poster',     href:'/poster' },
                  { icon:'👤', label:'Edit Profile',      action:() => { setTab('profile'); setEditMode(true); } },
                  { icon:'📂', label:'Upload Documents',  action:() => setTab('documents') },
                ].map(a => a.href ? (
                  <Link key={a.label} href={a.href} className={`card ${styles.quickCard}`}>
                    <span className={styles.quickIcon}>{a.icon}</span>
                    <span>{a.label}</span>
                  </Link>
                ) : (
                  <button key={a.label} onClick={a.action} className={`card ${styles.quickCard}`}>
                    <span className={styles.quickIcon}>{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COURSES */}
          {tab==='courses' && (
            <div>
              {profile?.enrolledCourses?.length > 0 ? (
                <div className={styles.coursesGrid}>
                  {profile.enrolledCourses.map((c,i) => (
                    <div key={i} className={`card ${styles.courseCard}`}>
                      <div className={styles.courseTitle}>{c.title||c}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`card ${styles.emptyState}`}>
                  <div className={styles.emptyIcon}>📚</div>
                  <h3 className="heading-md">No Courses Yet</h3>
                  <p className="body-md">Your enrolled courses will appear here once your enrollment is processed by ILMORA.</p>
                  <a href="/#contact" className="btn btn-primary" style={{marginTop:'1.25rem'}}>Contact ILMORA to Enroll</a>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION STATUS */}
          {tab==='status' && (
            <div className="card" style={{padding:'2rem'}}>
              <h3 className={styles.cardTitle}>Application Timeline</h3>
              <div className={styles.timelineWrap}>
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className={`${styles.timelineItem} ${i <= stepIndex ? styles.timelineDone : ''} ${i === stepIndex ? styles.timelineCurrent : ''}`}>
                    <div className={styles.timelineDot}>{i < stepIndex ? '✓' : i+1}</div>
                    <div className={styles.timelineContent}>
                      <strong className={styles.timelineTitle}>{step}</strong>
                      {i === stepIndex && <span className={styles.timelineCurrent}> ← Current</span>}
                    </div>
                    {i < STATUS_STEPS.length-1 && <div className={`${styles.timelineLine} ${i < stepIndex ? styles.timelineLineDone : ''}`} />}
                  </div>
                ))}
              </div>
              <div style={{marginTop:'2rem', padding:'1.25rem', background:'rgba(201,168,76,0.07)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(201,168,76,0.18)'}}>
                <p className="body-md">Your current status: <strong style={{color:'var(--gold)'}}>{appStatus}</strong></p>
                <p className="body-md" style={{marginTop:'0.5rem'}}>Contact your advisor for updates: <strong>+971 52 968 2123</strong></p>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab==='documents' && (
            <div>
              <div className={styles.docsGrid}>
                {DOC_TYPES.map(dtype => {
                  const uploaded = docs.find(d => d.type === dtype);
                  return (
                    <div key={dtype} className={`card ${styles.docCard}`}>
                      <div className={styles.docIcon}>{uploaded ? '✅' : '📄'}</div>
                      <strong className={styles.docName}>{dtype}</strong>
                      {uploaded ? (
                        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',width:'100%'}}>
                          <span className="status status-active">Uploaded</span>
                          <a href={uploaded.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View →</a>
                        </div>
                      ) : (
                        <>
                          <label className="btn btn-secondary btn-sm" style={{width:'100%',textAlign:'center',cursor:uploading?'not-allowed':'pointer'}}>
                            {uploading ? '⌛ Uploading…' : '📤 Upload'}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} disabled={uploading}
                              onChange={e => handleDocUpload(e, dtype)} />
                          </label>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{marginTop:'1.5rem', padding:'1.25rem'}}>
                <p className="body-md">Upload clear scans or photos. Accepted formats: PDF, JPG, PNG. Max 10MB per file.</p>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab==='profile' && (
            <div className={`card ${styles.profileCard}`}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>{profile?.name?.[0]?.toUpperCase() || 'S'}</div>
                <div>
                  <h2 className={styles.profileName}>{profile?.name}</h2>
                  <p className="body-md">{profile?.email}</p>
                </div>
                {!editMode && (
                  <button onClick={() => { setEditMode(true); setEditData({ name:profile?.name||'', phone:profile?.phone||'' }); }}
                    className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}}>✏️ Edit</button>
                )}
              </div>

              {editMode ? (
                <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginTop:'1.5rem'}}>
                  {[['name','Full Name'],['phone','Phone Number']].map(([k,l]) => (
                    <div key={k} className="form-group">
                      <label className="form-label">{l}</label>
                      <input className="form-input" value={editData[k]||''} onChange={e => setEditData(d=>({...d,[k]:e.target.value}))} />
                    </div>
                  ))}
                  <div style={{display:'flex',gap:'0.75rem'}}>
                    <button onClick={saveProfile} className="btn btn-primary">Save Changes</button>
                    <button onClick={() => setEditMode(false)} className="btn btn-ghost">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileFields}>
                  {[
                    ['Full Name',  profile?.name],
                    ['Email',      profile?.email],
                    ['Phone',      profile?.phone||'—'],
                    ['Status',     profile?.applicationStatus||'pending'],
                    ['Member Since', formatDate(profile?.createdAt)],
                  ].map(([l,v]) => (
                    <div key={l} className={styles.profileField}>
                      <span className={styles.profileFieldLabel}>{l}</span>
                      <span className={styles.profileFieldVal}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return <StudentGuard><StudentDashboardInner /></StudentGuard>;
}
