// lib/constants.js — single source of truth for all site content

export const SITE = {
  name:    'ILMORA Education',
  tagline: 'Get Your Degree. We Handle the Rest.',
  phone:   { uae: '+971 52 968 2123', india: '+91 74830 08412' },
  email:   'Ilmoraeducationgroup@gmail.com',
  whatsapp:'https://wa.me/971529682123?text=Hi%20ILMORA%2C%20I%27m%20interested%20in%20your%20programs.',
  instagram:'https://www.instagram.com/ilmora_education',
};

export const UNIVERSITIES = [
  { id:'osgu',      name:'Om Sterling Global University',  country:'Rajasthan · NAAC',    img:'/images/universities/osgu.png',      url:'https://osgu.ac.in' },
  { id:'jamia',     name:'Jamia Urdu Aligarh',             country:'Aligarh · UGC',       img:'/images/universities/jamia-urdu.png', url:'https://www.jamiaurdu.ac.in' },
  { id:'lingayas',  name:"Lingaya's Vidyapeeth",           country:'Deemed · NAAC',       img:'/images/universities/lingayas.png',   url:'https://lingayasuniversity.edu.in' },
  { id:'arni',      name:'Arni University',                country:'Himachal · UGC',      img:'/images/universities/arni.png',       url:'https://www.arniuniversity.edu.in' },
  { id:'rntu',      name:'Rabindranath Tagore University', country:'MP · NAAC',           img:'/images/universities/rntu.png',       url:'https://www.rntu.ac.in' },
  { id:'rgu',       name:'Rajiv Gandhi University',        country:'Arunachal · Central', img:'/images/universities/rgu.png',        url:'https://www.rgu.ac.in' },
];

export const PROGRAMS = [
  { id:'ug',    icon:'🎓', title:'UG Programs',     sub:'Bachelor Degrees',    desc:'BA, BCom, BSc, BCA, BBA. Weekend & online for working professionals.' },
  { id:'pg',    icon:'🏛️', title:'PG Programs',     sub:'Master Degrees',      desc:'MA, MCom, MSc, MCA, MBA with flexible scheduling. 1–2 year completion.' },
  { id:'eng',   icon:'⚙️', title:'BTech / MTech',   sub:'Engineering Degrees', desc:'Full UAE equivalency support. Recognized for engineering roles across UAE.' },
  { id:'phd',   icon:'🔬', title:'PhD Programs',    sub:'Doctoral Research',   desc:'Research-based PhD from accredited universities with full mentorship.' },
  { id:'cert',  icon:'📜', title:'Certifications',  sub:'Short Courses',       desc:'Professional certifications in months. Instantly boost your credentials.' },
  { id:'equiv', icon:'🌐', title:'UAE Equivalency', sub:'Recognition Service', desc:'100% handled by ILMORA. We manage HEC/MOHE submissions and all paperwork.' },
];

export const SERVICES = [
  { id:'attest', icon:'📋', title:'Certificate Attestation', desc:'Complete state-level, MEA, and UAE embassy attestation — end to end.' },
  { id:'equiv',  icon:'🇦🇪', title:'UAE Equivalency',         desc:'Full MOHE equivalency process for BTech/MTech. Every step managed.' },
  { id:'advisor',icon:'🤝', title:'Personal Advisor',        desc:'Dedicated advisor from enrollment to international recognition.' },
  { id:'docs',   icon:'📦', title:'Document Logistics',      desc:'We courier, verify, and dispatch all your documents internationally.' },
];

export const STATS = [
  { value: 50000, suffix: 'k+', label: 'Students Reached' },
  { value: 200,   suffix: '+',  label: 'Institutions' },
  { value: 25,    suffix: '+',  label: 'Countries' },
  { value: 100,   suffix: '%',  label: 'Documentation Handled' },
];

export const FAQS = [
  { q:'Are the certificates internationally recognized?',     a:'Yes. All certificates are from UGC-recognized, NAAC-accredited institutions — accepted internationally including UAE equivalency and overseas employment.' },
  { q:'Do I need to handle attestation myself?',             a:"Absolutely not. This is ILMORA's biggest differentiator. We handle 100% of attestation, equivalency, and documentation on your behalf." },
  { q:'Can I study while working full time?',                a:'Yes — that\'s exactly who we built this for. All programs have weekend classes and flexible online options. You never need to take leave.' },
  { q:'How affordable are the programs?',                    a:'Significantly more affordable than traditional universities. We offer flexible monthly payment plans with no hidden costs.' },
  { q:'What is UAE equivalency and do you support it?',      a:'UAE equivalency is getting your Indian degree recognized by UAE authorities — required for many professional roles. ILMORA handles the entire process.' },
  { q:'How long does it take to complete a degree?',         a:'UG degrees: 3 years. PG: 1–2 years. Certifications: a few months. Designed to minimize duration without compromising quality.' },
  { q:'What happens after I enroll?',                        a:'You get a dedicated advisor through classes, assignments, and exams. After graduation, ILMORA manages all post-degree documentation.' },
];

export const JOURNEY_STEPS = [
  { n:'01', title:'Choose Program',   desc:'Browse flexible UG, PG, PhD, or certification programs matching your career goals.' },
  { n:'02', title:'Enroll & Learn',   desc:'Weekend classes, online support, assignment help — study completely at your pace.' },
  { n:'03', title:'Graduate',         desc:'Complete your degree from an authorized, accredited university with full support.' },
  { n:'04', title:'We Handle Docs',   desc:'ILMORA manages attestation, UAE equivalency, and all international recognition.' },
  { n:'05', title:'Career Growth',    desc:'Your certified, recognized qualification opens new doors globally.' },
];

export const INTEREST_OPTIONS = [
  'UG Program (Bachelor Degree)',
  'PG Program (Master Degree)',
  'PhD Program',
  'BTech / MTech (Technical Degree)',
  'Short Certification Course',
  'UAE Equivalency Support',
  'Certificate Attestation',
];
