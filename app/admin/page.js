'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { AdminGuard } from '@/components/features/AuthGuard';
import { formatDate } from '@/lib/utils';
import { PROGRAMS } from '@/lib/constants';
import toast from 'react-hot-toast';
import styles from './admin.module.css';

const TABS = [
  { id:'overview',  icon:'📊', label:'Overview' },
  { id:'students',  icon:'👥', label:'Students' },
  { id:'leads',     icon:'📥', label:'Leads' },
  { id:'courses',   icon:'🎓', label:'Courses' },
  { id:'documents', icon:'📂', label:'Documents' },
  { id:'settings',  icon:'⚙️', label:'Settings' },
];

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`card ${styles.statCard}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function AdminDashboardInner() {
  const { user, logout } = useAuth();
  const [tab,      setTab]      = useState('overview');
  const [students, setStudents] = useState([]);
  const [leads,    setLeads]    = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sideOpen, setSideOpen] = useState(false);

  // Modals
  const [leadModal,   setLeadModal]   = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [leadForm,    setLeadForm]    = useState({ name:'', phone:'', email:'', interest:'', notes:'' });
  const [courseForm,  setCourseForm]  = useState({ title:'', type:'UG', duration:'', university:'', fee:'' });
  const [search,      setSearch]      = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sSnap, lSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db,'users'),    orderBy('createdAt','desc'))),
        getDocs(query(collection(db,'leads'),   orderBy('createdAt','desc'))),
        getDocs(query(collection(db,'courses'), orderBy('createdAt','desc'))),
      ]);
      setStudents(sSnap.docs.filter(d => d.data().role === 'student').map(d => ({ id:d.id, ...d.data() })));
      setLeads(   lSnap.docs.map(d => ({ id:d.id, ...d.data() })));
      setCourses( cSnap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const updateStudentStatus = async (uid, status) => {
    try {
      await updateDoc(doc(db,'users',uid), { applicationStatus: status, updatedAt: serverTimestamp() });
      setStudents(s => s.map(st => st.id===uid ? { ...st, applicationStatus:status } : st));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const deleteStudent = async (uid) => {
    if (!confirm('Delete this student?')) return;
    try { await deleteDoc(doc(db,'users',uid)); setStudents(s => s.filter(st => st.id!==uid)); toast.success('Student removed'); }
    catch { toast.error('Delete failed'); }
  };

  const addLead = async (e) => {
    e.preventDefault();
    try {
      const ref = await addDoc(collection(db,'leads'), { ...leadForm, status:'new', createdAt: serverTimestamp() });
      setLeads(l => [{ id:ref.id, ...leadForm, status:'new' }, ...l]);
      setLeadModal(false);
      setLeadForm({ name:'', phone:'', email:'', interest:'', notes:'' });
      toast.success('Lead added');
    } catch { toast.error('Failed to add lead'); }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await updateDoc(doc(db,'leads',id), { status, updatedAt: serverTimestamp() });
      setLeads(l => l.map(ld => ld.id===id ? { ...ld, status } : ld));
      toast.success('Lead status updated');
    } catch { toast.error('Update failed'); }
  };

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try { await deleteDoc(doc(db,'leads',id)); setLeads(l => l.filter(ld => ld.id!==id)); toast.success('Lead removed'); }
    catch { toast.error('Delete failed'); }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      const ref = await addDoc(collection(db,'courses'), { ...courseForm, active:true, createdAt: serverTimestamp() });
      setCourses(c => [{ id:ref.id, ...courseForm, active:true }, ...c]);
      setCourseModal(false);
      setCourseForm({ title:'', type:'UG', duration:'', university:'', fee:'' });
      toast.success('Course added');
    } catch { toast.error('Failed to add course'); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await deleteDoc(doc(db,'courses',id)); setCourses(c => c.filter(co => co.id!==id)); toast.success('Course removed'); }
    catch { toast.error('Delete failed'); }
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.applicationStatus==='active' || s.status==='active').length,
    completed: students.filter(s => s.applicationStatus==='completed').length,
    pending: students.filter(s => !s.applicationStatus || s.applicationStatus==='pending').length,
  };

  const filteredStudents = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sideOpen ? styles.sideOpen : ''}`}>
        <div className={styles.sideHeader}>
          <Image src="/images/logo/ilmora-white.png" alt="ILMORA" width={100} height={30} />
          <button className={styles.sideClose} onClick={() => setSideOpen(false)}>✕</button>
        </div>
        <div className={styles.sideUser}>
          <div className={styles.sideAvatar}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <div className={styles.sideName}>{user?.name || 'Admin'}</div>
            <div className={styles.sideRole}>Administrator</div>
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
          <Link href="/" className={`btn btn-ghost btn-sm ${styles.viewSiteBtn}`}>🌐 View Site</Link>
          <button onClick={logout} className="btn btn-danger btn-sm btn-full">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="dash-header">
          <button className={styles.hamburger} onClick={() => setSideOpen(true)}>☰</button>
          <h1 className={styles.pageTitle}>{TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}</h1>
          <div style={{ display:'flex', gap:'0.5rem', marginLeft:'auto' }}>
            <button onClick={loadAll} className="btn btn-ghost btn-sm" title="Refresh">↻</button>
          </div>
        </header>

        <div className="dash-content">

          {/* OVERVIEW */}
          {tab==='overview' && (
            <div>
              <div className={styles.statsRow}>
                <StatCard icon="👥" label="Total Students" value={stats.total}     color="var(--gold)" />
                <StatCard icon="✅" label="Active"          value={stats.active}    color="var(--success)" />
                <StatCard icon="🏆" label="Completed"       value={stats.completed} color="#3b82f6" />
                <StatCard icon="⏳" label="Pending"         value={stats.pending}   color="var(--warning)" />
              </div>
              <div className={styles.overviewGrid}>
                <div className={`card ${styles.overviewCard}`}>
                  <h3 className={styles.cardTitle}>Recent Students</h3>
                  {students.slice(0,5).map(s => (
                    <div key={s.id} className={styles.recentRow}>
                      <div className={styles.recentAvatar}>{s.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <div className={styles.recentName}>{s.name}</div>
                        <div className={styles.recentEmail}>{s.email}</div>
                      </div>
                      <span className={`status status-${s.applicationStatus||'pending'}`}>{s.applicationStatus||'pending'}</span>
                    </div>
                  ))}
                  {students.length===0 && <p className="body-md">No students yet.</p>}
                </div>
                <div className={`card ${styles.overviewCard}`}>
                  <h3 className={styles.cardTitle}>Recent Leads</h3>
                  {leads.slice(0,5).map(l => (
                    <div key={l.id} className={styles.recentRow}>
                      <div className={styles.recentAvatar}>{l.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <div className={styles.recentName}>{l.name}</div>
                        <div className={styles.recentEmail}>{l.phone}</div>
                      </div>
                      <span className={`status status-${l.status==='converted'?'completed':l.status==='new'?'pending':'active'}`}>{l.status||'new'}</span>
                    </div>
                  ))}
                  {leads.length===0 && <p className="body-md">No leads yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {tab==='students' && (
            <div>
              <div className={styles.tableHeader}>
                <input className={`form-input ${styles.searchInput}`} placeholder="🔍 Search by name or email…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {loading ? <p className="body-md">Loading…</p> : (
                <div className="card" style={{ overflow:'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id}>
                          <td><strong style={{color:'var(--text)'}}>{s.name}</strong></td>
                          <td>{s.email}</td>
                          <td>{s.phone||'—'}</td>
                          <td>
                            <select className={styles.statusSelect}
                              value={s.applicationStatus||'pending'}
                              onChange={e => updateStudentStatus(s.id, e.target.value)}>
                              {['pending','active','under_review','enrolled','completed','rejected'].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </td>
                          <td>{formatDate(s.createdAt)}</td>
                          <td>
                            <button onClick={() => deleteStudent(s.id)} className="btn btn-danger btn-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length===0 && <p className="body-md" style={{padding:'1.5rem'}}>No students found.</p>}
                </div>
              )}
            </div>
          )}

          {/* LEADS */}
          {tab==='leads' && (
            <div>
              <div className={styles.tableHeader}>
                <button onClick={() => setLeadModal(true)} className="btn btn-primary">+ Add Lead</button>
              </div>
              {loading ? <p className="body-md">Loading…</p> : (
                <div className="card" style={{ overflow:'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Interest</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {leads.map(l => (
                        <tr key={l.id}>
                          <td><strong style={{color:'var(--text)'}}>{l.name}</strong></td>
                          <td>{l.phone}</td>
                          <td>{l.email||'—'}</td>
                          <td>{l.interest||'—'}</td>
                          <td>
                            <select className={styles.statusSelect} value={l.status||'new'}
                              onChange={e => updateLeadStatus(l.id, e.target.value)}>
                              {['new','contacted','qualified','converted','lost'].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </td>
                          <td>
                            <button onClick={() => deleteLead(l.id)} className="btn btn-danger btn-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {leads.length===0 && <p className="body-md" style={{padding:'1.5rem'}}>No leads yet.</p>}
                </div>
              )}
            </div>
          )}

          {/* COURSES */}
          {tab==='courses' && (
            <div>
              <div className={styles.tableHeader}>
                <button onClick={() => setCourseModal(true)} className="btn btn-primary">+ Add Course</button>
              </div>
              <div className={styles.coursesGrid}>
                {courses.map(c => (
                  <div key={c.id} className={`card ${styles.courseCard}`}>
                    <div className={styles.courseType}>{c.type}</div>
                    <strong className={styles.courseTitle}>{c.title}</strong>
                    <div className={styles.courseMeta}>⏱ {c.duration} &nbsp;·&nbsp; 🏛️ {c.university}</div>
                    {c.fee && <div className={styles.courseFee}>💰 {c.fee}</div>}
                    <button onClick={() => deleteCourse(c.id)} className="btn btn-danger btn-sm" style={{marginTop:'1rem'}}>Remove</button>
                  </div>
                ))}
                {courses.length===0 && <p className="body-md">No courses yet. Add your first course.</p>}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab==='documents' && (
            <div className="card" style={{padding:'2rem'}}>
              <h3 className={styles.cardTitle}>Student Documents</h3>
              <p className="body-md" style={{marginTop:'0.5rem'}}>Documents uploaded by students appear here. Use the Students tab to manage individual profiles.</p>
              {students.filter(s => s.documents?.length > 0).map(s => (
                <div key={s.id} className={styles.docSection}>
                  <strong style={{color:'var(--text)'}}>{s.name}</strong>
                  <div className={styles.docList}>
                    {s.documents.map((d,i) => (
                      <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        📄 {d.name || d.type || `Document ${i+1}`}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {tab==='settings' && (
            <div className={styles.settingsGrid}>
              <div className={`card ${styles.settingsCard}`}>
                <h3 className={styles.cardTitle}>Admin Profile</h3>
                <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginTop:'1rem'}}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" defaultValue={user?.name||''} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" defaultValue={user?.email||''} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input className="form-input" defaultValue={user?.role||'admin'} readOnly />
                  </div>
                </div>
              </div>
              <div className={`card ${styles.settingsCard}`}>
                <h3 className={styles.cardTitle}>Quick Links</h3>
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'1rem'}}>
                  <Link href="/brochure" className="btn btn-secondary">📄 Brochure Generator</Link>
                  <Link href="/poster"   className="btn btn-secondary">🎨 Poster Generator</Link>
                  <Link href="/"         className="btn btn-ghost">🌐 View Public Site</Link>
                  <button onClick={logout} className="btn btn-danger">Sign Out</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Lead Modal */}
      {leadModal && (
        <div className="modal-overlay" onClick={() => setLeadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add New Lead</h2>
            <form onSubmit={addLead} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {[['name','Full Name *','text',true],['phone','Phone *','tel',true],['email','Email','email',false]].map(([k,l,t,r]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={t} required={r} value={leadForm[k]} onChange={e => setLeadForm(f=>({...f,[k]:e.target.value}))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Interest</label>
                <input className="form-input" value={leadForm.interest} onChange={e => setLeadForm(f=>({...f,interest:e.target.value}))} placeholder="Program or service interested in" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={leadForm.notes} onChange={e => setLeadForm(f=>({...f,notes:e.target.value}))} />
              </div>
              <div style={{display:'flex',gap:'0.75rem'}}>
                <button type="submit"                             className="btn btn-primary btn-full">Add Lead</button>
                <button type="button" onClick={()=>setLeadModal(false)} className="btn btn-ghost btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {courseModal && (
        <div className="modal-overlay" onClick={() => setCourseModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add New Course</h2>
            <form onSubmit={addCourse} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input className="form-input" required value={courseForm.title} onChange={e => setCourseForm(f=>({...f,title:e.target.value}))} placeholder="e.g. MBA Finance" />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={courseForm.type} onChange={e => setCourseForm(f=>({...f,type:e.target.value}))}>
                    {['UG','PG','BTech','MTech','PhD','Certificate'].map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={courseForm.duration} onChange={e => setCourseForm(f=>({...f,duration:e.target.value}))} placeholder="e.g. 2 Years" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">University</label>
                <input className="form-input" value={courseForm.university} onChange={e => setCourseForm(f=>({...f,university:e.target.value}))} placeholder="Partner university name" />
              </div>
              <div className="form-group">
                <label className="form-label">Fee (optional)</label>
                <input className="form-input" value={courseForm.fee} onChange={e => setCourseForm(f=>({...f,fee:e.target.value}))} placeholder="e.g. ₹45,000/year" />
              </div>
              <div style={{display:'flex',gap:'0.75rem'}}>
                <button type="submit"                               className="btn btn-primary btn-full">Add Course</button>
                <button type="button" onClick={()=>setCourseModal(false)} className="btn btn-ghost btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return <AdminGuard><AdminDashboardInner /></AdminGuard>;
}
