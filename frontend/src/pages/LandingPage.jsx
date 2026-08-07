import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FrameSequencePlayer from '../components/FrameSequencePlayer';
import ScrollLockSection from '../components/ScrollLockSection';

/* ── tiny hooks ── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── static data ── */
const STATS = [
  { value: 10000, suffix: '+', label: 'Problems Solved' },
  { value: 500,   suffix: '+', label: 'Students' },
  { value: 50,    suffix: '+', label: 'Companies' },
  { value: 150,   suffix: '+', label: 'DSA Sheets' },
];
const TESTIMONIALS = [
  { text: "This platform finally gave structure to my preparation. I stopped random grinding and started following a real roadmap.", name: "Aarav Singh", role: "Placed at Google, SDE-2" },
  { text: "The leaderboard with my squad kept me accountable every single day. Cracked my Microsoft OA after 3 weeks of consistent grind.", name: "Priya Mehta", role: "Placed at Microsoft" },
  { text: "Striver A2Z + GrindFam tracking = perfect combo. I could finally see my own progress and it was so motivating.", name: "Rohan Kapoor", role: "Placed at Flipkart" },
];
const COMPANIES = ['Google','Amazon','Meta','Microsoft','Netflix','Apple','Uber','Adobe','Atlassian','Flipkart','Stripe','Airbnb'];

/* ════════════════════════════════════════════════════════════════════════
   LandingPage — Full Complete Frame Sequences (192, 192, 153 frames)
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [scrolled,        setScrolled]        = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  
  // Progress states driving text fade-ins & animations
  const [heroProgress,    setHeroProgress]    = useState(0);
  const [howProgress,     setHowProgress]     = useState(0);
  const [ctaProgress,     setCtaProgress]     = useState(0);

  // Direct player refs for zero-lag canvas updates
  const heroPlayerRef = useRef(null);
  const howPlayerRef  = useRef(null);
  const ctaPlayerRef  = useRef(null);

  const [statsRef, statsInView]    = useInView(0.3);
  const [probRef,  probInView]     = useInView(0.2);
  const [featRef,  featInView]     = useInView(0.1);
  const [dashRef,  dashInView]     = useInView(0.2);
  const [lbRef,    lbInView]       = useInView(0.2);
  const [testRef,  testInView]     = useInView(0.1);

  const c0 = useCountUp(STATS[0].value, 2200, statsInView);
  const c1 = useCountUp(STATS[1].value, 1800, statsInView);
  const c2 = useCountUp(STATS[2].value, 1600, statsInView);
  const c3 = useCountUp(STATS[3].value, 2000, statsInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => navigate(user ? '/dashboard' : '/register');

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Companies', to: '/companies' },
    { label: 'Sheets', to: '/sheets' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const S = {
    page:      { fontFamily: "'Inter', system-ui, sans-serif" },
    navWrap:   { maxWidth:'1280px', margin:'0 auto', padding:'0 24px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' },
    logo:      { width:'32px', height:'32px', borderRadius:'8px', background:'#FF6B2C', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'14px', boxShadow:'0 0 20px rgba(255,107,44,0.5)' },
    ctaBtn:    { background:'#FF6B2C', color:'white', padding:'8px 20px', borderRadius:'999px', fontSize:'14px', fontWeight:'600', border:'none', cursor:'pointer', boxShadow:'0 0 20px rgba(255,107,44,0.4)', transition:'all 0.2s' },
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F0] min-h-screen overflow-x-clip antialiased" style={S.page}>

      {/* ── GLOBAL KEYFRAMES ─────────────────────────────────────── */}
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
        @keyframes pulseGlow { 0%,100%{opacity:.5} 50%{opacity:1} }
        .marquee-track { display:flex; gap:24px; animation:marquee 30s linear infinite; width:max-content; }
        .marquee-track:hover { animation-play-state:paused }
        .dot-grid { background-image:radial-gradient(circle, rgba(255,107,44,0.15) 1px, transparent 1px); background-size:28px 28px; }
        .grad-text { background:linear-gradient(135deg,#FF6B2C,#FF8A3D,#FFB347); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{ height:'72px', background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div style={S.navWrap}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
            <img src="/logo.png" alt="GrindFam Logo" style={{ width:'34px', height:'34px', borderRadius:'10px', objectFit:'cover', boxShadow:'0 0 20px rgba(255,107,44,0.4)', border:'1px solid rgba(255,255,255,0.1)' }} />
            <span style={{ fontWeight:'800', fontSize:'20px', color:'white', letterSpacing:'-0.5px' }}>GrindFam</span>
          </Link>

          <div className="hidden md:flex" style={{ gap:'32px', alignItems:'center' }}>
            {navLinks.map(l => l.to
              ? <Link key={l.label} to={l.to} style={{ color:'#8A8A85', fontSize:'14px', fontWeight:'500', textDecoration:'none' }}>{l.label}</Link>
              : <a key={l.label} href={l.href} style={{ color:'#8A8A85', fontSize:'14px', fontWeight:'500', textDecoration:'none' }}>{l.label}</a>
            )}
          </div>

          <div className="hidden md:flex" style={{ gap:'12px', alignItems:'center' }}>
            {user
              ? <Link to="/dashboard" style={{ ...S.ctaBtn, textDecoration:'none', display:'inline-block' }}>Dashboard →</Link>
              : <>
                  <Link to="/login" style={{ color:'#8A8A85', fontSize:'14px', fontWeight:'500', textDecoration:'none' }}>Login</Link>
                  <button onClick={handleCTA} style={S.ctaBtn}>
                    Start Free →
                  </button>
                </>
            }
          </div>

          <button className="md:hidden" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'8px' }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:'20px', height:'2px', background:'white', marginBottom: i<2?'4px':0,
                transform: mobileMenuOpen ? (i===0?'rotate(45deg) translateY(6px)': i===2?'rotate(-45deg) translateY(-6px)':'none') : 'none',
                opacity: mobileMenuOpen && i===1 ? 0 : 1 }} />
            ))}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ background:'#121212', borderTop:'1px solid rgba(255,255,255,0.08)', padding:'16px 24px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {navLinks.map(l => l.to
              ? <Link key={l.label} to={l.to} onClick={()=>setMobileMenuOpen(false)} style={{ color:'#8A8A85', fontSize:'14px', textDecoration:'none', padding:'8px 0' }}>{l.label}</Link>
              : <a key={l.label} href={l.href} onClick={()=>setMobileMenuOpen(false)} style={{ color:'#8A8A85', fontSize:'14px', textDecoration:'none', padding:'8px 0' }}>{l.label}</a>
            )}
            <button onClick={handleCTA} style={{ ...S.ctaBtn, marginTop:'8px', padding:'10px 20px', textAlign:'center' }}>Start Free →</button>
          </div>
        )}
      </nav>

      {/* ══ 1. HERO — FULL 192 FRAMES ═════════════════════════════════ */}
      <ScrollLockSection totalScrollUnits={2800} playerRef={heroPlayerRef} onProgress={setHeroProgress}>
        {(progress) => (
          <>
            <FrameSequencePlayer
              ref={heroPlayerRef}
              framesFolder="hero"
              frameCount={192}
              playMode="external"
              fit="cover"
              eager={true}
              className="absolute inset-0 w-full h-full"
            />

            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.65) 28%, transparent 45%, transparent 55%, rgba(10,10,10,0.65) 72%, rgba(10,10,10,0.92) 100%), linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 30%, #0A0A0A 100%)', pointerEvents:'none' }} />
            <div className="dot-grid" style={{ position:'absolute', inset:0, opacity:0.12, pointerEvents:'none' }} />

            {/* ── LEFT SIDE MAIN CONTENT ── */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(24px, 5vw, 72px)',
                transform: 'translateY(-50%)',
                maxWidth: '420px',
                zIndex: 20,
                opacity: Math.max(0, 1 - progress * 1.4),
                transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              }}
            >
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'999px', padding:'6px 14px', fontSize:'12px', fontWeight:'600', color:'#FF8A3D', marginBottom:'20px' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#FF6B2C', animation:'pulseGlow 2s ease infinite' }} />
                Trusted by 500+ software engineers
              </div>

              <h1 style={{ fontSize:'clamp(38px, 4.5vw, 64px)', fontWeight:'900', lineHeight:'1.04', letterSpacing:'-2px', color:'white', marginBottom:'16px' }}>
                GRIND SMART.<br/>
                <span className="grad-text">NOT JUST HARD.</span>
              </h1>

              <p style={{ color:'#E5E0DE', fontSize:'clamp(15px, 1.5vw, 18px)', lineHeight:'1.6', marginBottom:'28px' }}>
                Track your coding interview journey, build consistency, and crack your dream company.
              </p>

              <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
                <button onClick={handleCTA} id="hero-cta-btn"
                  style={{ background:'#FF6B2C', color:'white', padding:'12px 28px', borderRadius:'999px', fontSize:'15px', fontWeight:'700', border:'none', cursor:'pointer', boxShadow:'0 0 35px rgba(255,107,44,0.6)' }}>
                  Start Grinding
                </button>
                <a href="#features" id="hero-demo-btn"
                  style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'12px 24px', borderRadius:'999px', fontSize:'15px', fontWeight:'600', textDecoration:'none' }}>
                  ▶ Watch Demo
                </a>
              </div>
            </div>

            {/* ── RIGHT SIDE FEATURE HIGHLIGHT CARDS ── */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                top: '50%',
                right: 'clamp(24px, 5vw, 72px)',
                transform: 'translateY(-50%)',
                flexDirection: 'column',
                gap: '16px',
                width: '320px',
                zIndex: 20,
                opacity: Math.max(0, 1 - progress * 1.4),
                transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              }}
            >
              {[
                { title: '50+ Company Tracks', desc: 'Curated problem sets for Google, Meta, Microsoft, Amazon.' },
                { title: 'Daily Squad Streaks', desc: 'Stay accountable with real-time squad leaderboards.' },
                { title: 'Striver & NeetCode Sheets', desc: 'Track your progress across all legendary DSA sheets.' },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(18,18,18,0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <h4 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{card.title}</h4>
                  <p style={{ color: '#8A8A85', fontSize: '12px', lineHeight: '1.5' }}>{card.desc}</p>
                </div>
              ))}
            </div>

            {/* ── SECONDARY MESSAGE (Fades in when Fox Wakes Up) ── */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(24px, 5vw, 72px)',
                transform: 'translateY(-50%)',
                maxWidth: '460px',
                zIndex: 20,
                opacity: progress > 0.45 ? Math.min(1, (progress - 0.45) * 2.4) : 0,
                transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
                pointerEvents: progress > 0.45 ? 'auto' : 'none',
              }}
            >
              <p style={{ color: '#FF6B2C', fontSize: '12px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>THE FOX IS AWAKE</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 52px)', fontWeight: '800', color: 'white', lineHeight: '1.1', marginBottom: '14px' }}>
                Consistency turns<br />doubt into mastery.
              </h2>
              <p style={{ color: '#8A8A85', fontSize: '15px', lineHeight: '1.65', maxWidth: '400px' }}>
                Keep scrolling to explore company roadmaps, curated sheets, and daily squad leaderboards.
              </p>
            </div>

            {/* Frame progress bar */}
            <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'3px', background:'rgba(255,255,255,0.06)', zIndex:30 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#FF6B2C,#FFB347)', width:`${progress*100}%` }} />
            </div>

            {/* Scroll indicator */}
            <div style={{ position:'absolute', bottom:'28px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', opacity: progress < 0.05 ? 0.7 : Math.max(0, 0.7 - progress * 2), pointerEvents:'none', zIndex:30 }}>
              <span style={{ fontSize:'10px', color:'#8A8A85', letterSpacing:'3px', textTransform:'uppercase' }}>
                {progress >= 0.98 ? 'Release — scrolling ↓' : 'Scroll to animate ↓'}
              </span>
              <svg width="16" height="16" fill="none" stroke="#FF6B2C" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </>
        )}
      </ScrollLockSection>

      {/* ══ 2. STATS ════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ padding:'64px 0', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(18,18,18,0.5)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'32px' }}>
            {[c0,c1,c2,c3].map((c,i)=>(
              <div key={i} style={{ textAlign:'center', opacity:statsInView?1:0, transform:statsInView?'translateY(0)':'translateY(16px)', transition:`all 0.5s ease ${i*80}ms` }}>
                <div style={{ fontSize:'clamp(36px,5vw,52px)', fontWeight:'900', color:i%2===0?'#FF6B2C':'white', letterSpacing:'-1px' }}>{c.toLocaleString()}{STATS[i].suffix}</div>
                <div style={{ fontSize:'14px', color:'#8A8A85', fontWeight:'500', marginTop:'6px' }}>{STATS[i].label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. PROBLEM STATEMENT ════════════════════════════════════ */}
      <section ref={probRef} style={{ padding:'120px 24px' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', textAlign:'center', opacity:probInView?1:0, transform:probInView?'translateY(0)':'translateY(32px)', transition:'all 0.6s ease' }}>
          <h2 style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:'900', color:'white', lineHeight:'1.1', letterSpacing:'-2px', marginBottom:'24px' }}>
            Still solving random<br/>
            <span style={{ color:'#4a4a48', textDecoration:'line-through', textDecorationColor:'#FF6B2C', textDecorationThickness:'4px' }}>LeetCode questions?</span>
          </h2>
          <p style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:'800', color:'#FF6B2C', marginBottom:'8px' }}>Stop guessing.</p>
          <p style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:'800', color:'white', marginBottom:'40px' }}>Prepare with direction.</p>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px' }}>
            {['Choose a company.','Follow a roadmap.','Track progress.','Stay consistent.'].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', color:'#8A8A85', fontSize:'18px' }}>
                <span style={{ color:'#FF6B2C' }}>→</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. FEATURES ═════════════════════════════════════════════ */}
      <section id="features" ref={featRef} style={{ padding:'120px 24px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <p style={{ color:'#FF6B2C', fontSize:'12px', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'12px' }}>Features</p>
            <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1px' }}>Everything you need to crack it.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'24px' }}>
            {[
              { icon: null, title:'Company Track', desc:'Curated problem sets for Google, Amazon, Meta, Microsoft and 50+ top companies.', featured:false },
              { icon: null, title:'DSA Sheets', desc:'Track Striver A2Z, NeetCode 150, Blind 75, Love Babbar 450 and more legendary sheets.', featured:true },
              { icon: null, title:'Leaderboard', desc:'Compete with friends and your squad. Daily rankings, streak battles, peer accountability.', featured:false },
            ].map((f,i)=>(
              <div key={i}
                style={{ position:'relative', borderRadius:'20px', padding:'32px', border:f.featured?'1px solid rgba(255,107,44,0.4)':'1px solid rgba(255,255,255,0.06)', background:f.featured?'linear-gradient(145deg,#1a0f00,#0f0800)':'#121212', boxShadow:f.featured?'0 0 40px rgba(255,107,44,0.15)':'none' }}>
                {f.featured && <div style={{ position:'absolute', top:'12px', right:'12px', background:'#FF6B2C', color:'white', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'999px' }}>Popular</div>}
                <div style={{ fontSize:'40px', marginBottom:'20px' }}>{f.icon}</div>
                <h3 style={{ fontSize:'20px', fontWeight:'700', color:'white', marginBottom:'12px' }}>{f.title}</h3>
                <p style={{ color:'#8A8A85', fontSize:'14px', lineHeight:'1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. HOW IT WORKS — FULL 192 FRAMES ═══════════════════════ */}
      <ScrollLockSection totalScrollUnits={2800} playerRef={howPlayerRef} onProgress={setHowProgress}>
        {(progress) => (
          <>
            <FrameSequencePlayer
              ref={howPlayerRef}
              framesFolder="standing"
              frameCount={192}
              playMode="external"
              fit="cover"
              className="absolute inset-0 w-full h-full"
            />

            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.72) 38%, rgba(10,10,10,0.1) 62%, transparent 100%), linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, transparent 35%, #0A0A0A 100%)', pointerEvents:'none' }} />

            <div style={{ position:'absolute', top:'50%', left:'clamp(24px, 5vw, 72px)', transform:'translateY(-50%)', maxWidth:'460px', zIndex:20 }}>
              <p style={{ color:'#FF6B2C', fontSize:'12px', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'12px' }}>How It Works</p>
              <h2 style={{ fontSize:'clamp(30px,4.2vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1.5px', marginBottom:'36px' }}>
                Four steps to<br/>interview ready.
              </h2>
              {[
                { step:'01', title:'Choose Track',   desc:'Pick your dream company or curated sheet. Set your timeline.' },
                { step:'02', title:'Solve Problems', desc:'Work through curated problems with video solutions and notes.' },
                { step:'03', title:'Build Streak',   desc:'Hit your daily target. Track consistency with a GitHub-style heatmap.' },
                { step:'04', title:'Interview Ready',desc:'Compare with friends, compete on leaderboards, walk in confident.' },
              ].map((item,i)=>{
                const stepOn = progress >= i * 0.22;
                return (
                  <div key={i} style={{ display:'flex', gap:'18px', opacity:stepOn?1:0.25, transition:'opacity 0.3s ease' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:stepOn?'#FF6B2C':'#1a1a1a', border:stepOn?'none':'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'700', flexShrink:0 }}>{item.step}</div>
                      {i<3 && <div style={{ width:'2px', flex:1, minHeight:'28px', background:stepOn?'rgba(255,107,44,0.4)':'rgba(255,255,255,0.06)' }} />}
                    </div>
                    <div style={{ paddingBottom:'24px' }}>
                      <h3 style={{ color:'white', fontWeight:'700', fontSize:'17px', marginBottom:'4px' }}>{item.title}</h3>
                      <p style={{ color:'#8A8A85', fontSize:'13px', lineHeight:'1.5' }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'3px', background:'rgba(255,255,255,0.06)', zIndex:30 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#FF6B2C,#FFB347)', width:`${progress*100}%` }} />
            </div>
          </>
        )}
      </ScrollLockSection>

      {/* ══ 6. DASHBOARD PREVIEW ════════════════════════════════════ */}
      <section ref={dashRef} style={{ padding:'120px 24px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1px', lineHeight:'1.1' }}>
              Everything<br/><span className="grad-text">in one dashboard.</span>
            </h2>
          </div>
          <div style={{ maxWidth:'960px', margin:'0 auto', opacity:dashInView?1:0, transform:dashInView?'translateY(0)':'translateY(32px)', transition:'all 0.6s ease' }}>
            <div style={{ background:'#121212', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.6)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 20px', background:'#0e0e0e', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', gap:'6px' }}>
                  {['#ef4444','#eab308','#22c55e'].map(c=><div key={c} style={{ width:'12px', height:'12px', borderRadius:'50%', background:c, opacity:0.6 }}/>)}
                </div>
                <div style={{ flex:1, maxWidth:'300px', margin:'0 auto', background:'rgba(255,255,255,0.05)', borderRadius:'8px', padding:'4px 12px', fontSize:'11px', color:'#8A8A85', textAlign:'center' }}>app.grindfam.io/dashboard</div>
              </div>
              <div style={{ display:'flex', minHeight:'460px' }}>
                <div style={{ width:'180px', background:'#0e0e0e', borderRight:'1px solid rgba(255,255,255,0.05)', padding:'16px' }}>
                  <div style={{ fontSize:'10px', color:'#8A8A85', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'12px' }}>Navigation</div>
                  {['Dashboard','Companies','Sheets','Leaderboard','Settings'].map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', borderRadius:'8px', fontSize:'12px', marginBottom:'2px', background:i===0?'rgba(255,107,44,0.1)':'transparent', color:i===0?'#FF6B2C':'#8A8A85' }}>
                      <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'currentColor', opacity:0.6 }}/>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ flex:1, padding:'24px', background:'#0A0A0A' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                    {[{l:'Solved',v:'342',c:'#FF6B2C'},{l:'Streak',v:'21 days',c:'#FFB347'},{l:'Target',v:'5/day',c:'#4ade80'},{l:'Rank',v:'Top 4%',c:'#60a5fa'}].map((s,i)=>(
                      <div key={i} style={{ background:'#121212', borderRadius:'12px', padding:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize:'10px', color:'#8A8A85', marginBottom:'4px' }}>{s.l}</div>
                        <div style={{ fontSize:'18px', fontWeight:'700', color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#121212', borderRadius:'12px', padding:'16px', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'16px' }}>
                    <div style={{ fontSize:'11px', color:'white', fontWeight:'600', marginBottom:'12px' }}>Activity — 2026</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(26,1fr)', gap:'3px' }}>
                      {Array.from({length:26}).map((_,i)=>{ const r=Math.random(); const bg=r>.8?'#FF6B2C':r>.5?'rgba(255,107,44,0.5)':r>.3?'rgba(255,107,44,0.2)':'rgba(255,255,255,0.04)'; return <div key={i} style={{ aspectRatio:'1', borderRadius:'2px', background:bg }}/>; })}
                    </div>
                  </div>
                  <div style={{ background:'#121212', borderRadius:'12px', padding:'16px', border:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize:'11px', color:'white', fontWeight:'600', marginBottom:'12px' }}>Topic Progress</div>
                    {[{name:'Arrays & Hashing',pct:100},{name:'Two Pointers',pct:85},{name:'Sliding Window',pct:60},{name:'Binary Search',pct:40}].map((t,i)=>(
                      <div key={i} style={{ marginBottom:'10px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'4px' }}>
                          <span style={{ color:'#8A8A85' }}>{t.name}</span><span style={{ color:'#FF6B2C' }}>{t.pct}%</span>
                        </div>
                        <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'999px', overflow:'hidden' }}>
                          <div style={{ height:'100%', background:'linear-gradient(90deg,#FF6B2C,#FFB347)', width:dashInView?`${t.pct}%`:'0%' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. COMPANY MARQUEE ══════════════════════════════════════ */}
      <section style={{ padding:'120px 0', borderTop:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px', textAlign:'center', marginBottom:'64px' }}>
          <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1px' }}>
            Built for<br/><span className="grad-text">your dream company.</span>
          </h2>
        </div>
        <div style={{ position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'120px', background:'linear-gradient(to right,#0A0A0A,transparent)', zIndex:10, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'120px', background:'linear-gradient(to left,#0A0A0A,transparent)', zIndex:10, pointerEvents:'none' }}/>
          <div className="marquee-track">
            {[...COMPANIES,...COMPANIES,...COMPANIES,...COMPANIES].map((company,i)=>(
              <div key={i} style={{ flexShrink:0, background:'#121212', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'14px 28px', color:'white', fontWeight:'700', fontSize:'16px', whiteSpace:'nowrap' }}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. LEADERBOARD ══════════════════════════════════════════ */}
      <section ref={lbRef} style={{ padding:'120px 24px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'64px', alignItems:'center' }}>
            <div style={{ opacity:lbInView?1:0, transform:lbInView?'translateX(0)':'translateX(-32px)', transition:'all 0.5s ease' }}>
              <p style={{ color:'#FF6B2C', fontSize:'12px', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'12px' }}>Social</p>
              <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1px', lineHeight:'1.1', marginBottom:'24px' }}>
                Grind together.<br/>Stay accountable.<br/><span style={{ color:'#FF6B2C' }}>Compete daily.</span>
              </h2>
              <p style={{ color:'#8A8A85', fontSize:'18px', lineHeight:'1.7', marginBottom:'32px', maxWidth:'380px' }}>Add friends, form squads, and race to the top of the leaderboard every single day.</p>
              <button onClick={handleCTA} style={{ background:'#FF6B2C', color:'white', padding:'12px 24px', borderRadius:'999px', fontSize:'14px', fontWeight:'600', border:'none', cursor:'pointer', boxShadow:'0 0 20px rgba(255,107,44,0.4)' }}>
                Join the Squad →
              </button>
            </div>
            <div style={{ opacity:lbInView?1:0, transform:lbInView?'translateX(0)':'translateX(32px)', transition:'all 0.5s ease' }}>
              <div style={{ background:'#121212', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'24px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <span style={{ color:'white', fontWeight:'700' }}>Today's Leaderboard</span>
                  <span style={{ color:'#FF6B2C', fontSize:'11px', fontWeight:'700', background:'rgba(255,107,44,0.1)', padding:'4px 10px', borderRadius:'999px' }}>Live</span>
                </div>
                {[{name:'Aarav',solved:342,streak:21,rank:'#1'},{name:'Priya',solved:298,streak:15,rank:'#2'},{name:'Rohan',solved:276,streak:12,rank:'#3'},{name:'Sneha',solved:241,streak:9,rank:'#4'},{name:'Karan',solved:218,streak:7,rank:'#5'}].map((entry,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', marginBottom:'6px', background:i===0?'rgba(255,107,44,0.08)':'transparent', border:i===0?'1px solid rgba(255,107,44,0.2)':'1px solid transparent' }}>
                    <span style={{ fontSize:'12px', fontWeight:'700', color:'#FF6B2C', width:'28px', textAlign:'center' }}>{entry.rank}</span>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#FF6B2C,#FF8A3D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'700' }}>{entry.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'white', fontSize:'14px', fontWeight:'600' }}>{entry.name}</div>
                      <div style={{ color:'#8A8A85', fontSize:'11px' }}>{entry.solved} solved</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:'#FF6B2C', fontSize:'14px', fontWeight:'700' }}>{entry.streak} days</div>
                      <div style={{ color:'#8A8A85', fontSize:'11px' }}>streak</div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', marginTop:'12px', paddingTop:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize:'18px', width:'28px', textAlign:'center' }}>?</span>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'1px dashed rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#8A8A85', fontSize:'10px' }}>You</div>
                    <div style={{ flex:1, color:'#8A8A85', fontSize:'13px' }}>Join to see your rank</div>
                    <button onClick={handleCTA} style={{ color:'#FF6B2C', fontSize:'12px', fontWeight:'600', background:'none', border:'none', cursor:'pointer' }}>Join →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ═════════════════════════════════════════ */}
      <section ref={testRef} style={{ padding:'120px 24px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', letterSpacing:'-1px' }}>What grinders say.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'24px' }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{ background:'#121212', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'24px', opacity:testInView?1:0, transform:testInView?'translateY(0)':'translateY(32px)', transition:`all 0.5s ease ${i*80}ms` }}>
                <div style={{ display:'flex', gap:'2px', marginBottom:'16px' }}>{[...Array(5)].map((_,j)=><span key={j} style={{ color:'#FF6B2C', fontSize:'16px' }}>★</span>)}</div>
                <blockquote style={{ color:'#F5F5F0', fontSize:'14px', lineHeight:'1.7', marginBottom:'20px' }}>"{t.text}"</blockquote>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'16px' }}>
                  <div style={{ color:'white', fontSize:'14px', fontWeight:'600' }}>— {t.name}</div>
                  <div style={{ color:'#FF6B2C', fontSize:'12px', marginTop:'2px' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10. FINAL CTA — FULL 153 GLITCH FRAMES ═══════════════════ */}
      <ScrollLockSection id="pricing" totalScrollUnits={2200} playerRef={ctaPlayerRef} onProgress={setCtaProgress}>
        {(progress) => (
          <>
            <FrameSequencePlayer
              ref={ctaPlayerRef}
              framesFolder="glitch"
              frameCount={153}
              playMode="external"
              fit="cover"
              className="absolute inset-0 w-full h-full"
            />

            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(10,10,10,0.85), rgba(10,10,10,0.65), rgba(10,10,10,0.9))', pointerEvents:'none' }}/>

            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10, padding:'0 24px', textAlign:'center' }}>
              <p style={{ color:'#FF6B2C', fontSize:'12px', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'16px' }}>Free Forever</p>
              <h2 style={{ fontSize:'clamp(40px,7vw,80px)', fontWeight:'900', color:'white', lineHeight:'1.05', letterSpacing:'-2px', marginBottom:'24px' }}>
                Ready to<br/><span className="grad-text">Start Your Grind?</span>
              </h2>
              <p style={{ color:'#8A8A85', fontSize:'18px', marginBottom:'40px', maxWidth:'400px' }}>Join 500+ engineers who are grinding smarter, not harder.</p>
              <button onClick={handleCTA} id="final-cta-btn"
                style={{ background:'#FF6B2C', color:'white', padding:'16px 48px', borderRadius:'999px', fontSize:'18px', fontWeight:'800', border:'none', cursor:'pointer', boxShadow:'0 0 50px rgba(255,107,44,0.5)', display:'inline-block' }}>
                Start Free
              </button>
              <p style={{ color:'#8A8A85', fontSize:'13px', marginTop:'16px' }}>No Credit Card Required</p>
            </div>

            <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'3px', background:'rgba(255,255,255,0.06)', zIndex:30 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#FF6B2C,#FFB347)', width:`${progress*100}%` }}/>
            </div>
          </>
        )}
      </ScrollLockSection>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'48px 24px', background:'#0A0A0A' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'32px', marginBottom:'40px' }}>
            <div style={{ gridColumn:'span 2' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#FF6B2C', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'14px' }}>G</div>
                <span style={{ fontWeight:'800', fontSize:'18px', color:'white' }}>GrindFam</span>
              </div>
              <p style={{ color:'#8A8A85', fontSize:'14px', lineHeight:'1.6', maxWidth:'260px' }}>Grind Smart. Not Just Hard.<br/>The elite DSA preparation platform.</p>
              <div style={{ display:'flex', gap:'20px', marginTop:'16px' }}>
                {['GitHub','Discord','Twitter'].map(s=>(
                  <a key={s} href="#" style={{ color:'#8A8A85', fontSize:'13px', textDecoration:'none' }}>{s}</a>
                ))}
              </div>
            </div>
            {[{h:'Product',items:['Features','Pricing','Companies','Sheets']},{h:'About',items:['About','Blog','Careers','Privacy']}].map(col=>(
              <div key={col.h}>
                <p style={{ color:'white', fontWeight:'600', fontSize:'14px', marginBottom:'16px' }}>{col.h}</p>
                {col.items.map(item=>(
                  <div key={item} style={{ marginBottom:'8px' }}>
                    <a href="#" style={{ color:'#8A8A85', fontSize:'13px', textDecoration:'none' }}>{item}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'24px', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
            <p style={{ color:'#8A8A85', fontSize:'12px' }}>© {new Date().getFullYear()} GrindFam. All rights reserved.</p>
            <div style={{ display:'flex', gap:'24px' }}>
              {['Terms','Privacy','Cookies'].map(item=>(
                <a key={item} href="#" style={{ color:'#8A8A85', fontSize:'12px', textDecoration:'none' }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
