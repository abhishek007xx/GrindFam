import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="font-body-md text-body-md antialiased bg-[#0A0A0A] text-[#e5e2e1] min-h-screen selection:bg-neon-accent selection:text-white relative overflow-x-hidden">
      {/* Navbar Shell */}
      <nav className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-lg border-b border-white/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <Link to="/" className="font-display text-headline-md font-bold text-on-surface">
            GrindFam
          </Link>
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-body-md text-body-md hover:text-neon-accent transition-all duration-300" to="/companies">
              Companies
            </Link>
            <Link className="text-on-surface-variant font-body-md text-body-md hover:text-neon-accent transition-all duration-300" to="/sheets">
              Sheets
            </Link>
            <Link className="text-on-surface-variant font-body-md text-body-md hover:text-neon-accent transition-all duration-300" to="/dashboard">
              Squad
            </Link>
            <a className="text-on-surface-variant font-body-md text-body-md hover:text-neon-accent transition-all duration-300" href="#features">
              Features
            </a>
          </div>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-primary-container text-white px-6 py-2 rounded-lg font-body-md text-body-md hover:bg-neon-accent transition-colors shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-on-surface-variant hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Log In
              </Link>
              <button
                onClick={handleCTA}
                className="bg-primary-container text-white px-6 py-2 rounded-lg font-body-md text-body-md hover:bg-neon-accent transition-colors shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:-translate-y-0.5"
              >
                Start Tracking Free
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden aurora-bg">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col items-center text-center">
          <h1 className="font-display text-4xl sm:text-6xl md:text-display text-white mb-6 tracking-tight max-w-4xl leading-tight">
            Crack Your Dream <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-accent to-primary">
              Software Job
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10">
            The elite tracking platform designed for software engineers to master data structures, algorithms, and system design with absolute focus.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleCTA}
              className="bg-primary-container text-white px-8 py-4 rounded-premium font-body-md text-body-md hover:bg-neon-accent transition-all duration-300 shadow-[0_0_25px_rgba(255,107,0,0.5)] hover:-translate-y-1"
            >
              Start Tracking Free
            </button>
            <Link
              to="/companies"
              className="glass-card text-white px-8 py-4 rounded-premium font-body-md text-body-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 inline-block"
            >
              Explore Companies
            </Link>
          </div>

          {/* Floating Dashboard Preview */}
          <div className="mt-16 w-full max-w-5xl glass-card rounded-premium border-white/20 p-2 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-premium pointer-events-none"></div>
            <img
              alt="Dashboard Preview"
              className="w-full h-auto rounded-[24px] border border-white/10 object-cover aspect-video opacity-90"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuwBAgRTkEv-jYy9dnor0QPyLMffUA3aUk75MRER2xmvnabWm2YkS50MJXeg6FP9xuCrnPudzKF-x9AZ84d1f60eKyuBw54fRTdxvAEG7zcD57lqv4l2tqyOTHaI7qlYKJO4cBHiMDiY_NOjUgRuYJvYGZpw_Bywjj9Sv3wVlHq4cprJNK0OG9plPIOrfYkyjI5UzMi9cSCB9dfsuZiqntAfSlM5pDit6-CafJJBU6z-CxL37Qp5VZ"
            />
          </div>
        </div>
      </section>

      {/* 2. Trusted By Marquee */}
      <section className="py-12 border-y border-white/5 bg-surface-container-lowest/50 relative">
        <div className="max-w-container-max mx-auto px-gutter mb-8 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-widest uppercase">
            Trusted by engineers at
          </p>
        </div>
        <div className="marquee-container w-full max-w-5xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="marquee-content items-center">
            <span className="font-display text-headline-md font-bold">Google</span>
            <span className="font-display text-headline-md font-bold">Amazon</span>
            <span className="font-display text-headline-md font-bold">Microsoft</span>
            <span className="font-display text-headline-md font-bold">Meta</span>
            <span className="font-display text-headline-md font-bold">Netflix</span>
            <span className="font-display text-headline-md font-bold">Apple</span>
          </div>
          <div aria-hidden="true" className="marquee-content items-center">
            <span className="font-display text-headline-md font-bold">Google</span>
            <span className="font-display text-headline-md font-bold">Amazon</span>
            <span className="font-display text-headline-md font-bold">Microsoft</span>
            <span className="font-display text-headline-md font-bold">Meta</span>
            <span className="font-display text-headline-md font-bold">Netflix</span>
            <span className="font-display text-headline-md font-bold">Apple</span>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-gutter mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-display text-headline-lg text-neon-accent">1000+</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">Problems</div>
          </div>
          <div>
            <div className="font-display text-headline-lg text-white">200+</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">Companies</div>
          </div>
          <div>
            <div className="font-display text-headline-lg text-white">50+</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">Topics</div>
          </div>
          <div>
            <div className="font-display text-headline-lg text-neon-accent">100%</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">Free</div>
          </div>
        </div>
      </section>

      {/* 3. Why GrindFam? */}
      <section id="features" className="py-section-padding max-w-container-max mx-auto px-gutter">
        <div className="text-center mb-16">
          <h2 className="font-display text-headline-lg text-white mb-4">The Complete Arsenal</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Everything you need to crush your next technical interview.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                corporate_fare
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              corporate_fare
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">Company Roadmaps</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Curated problem sets based on recent interview experiences at top tech giants.
            </p>
          </div>
          {/* Card 2 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                analytics
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              analytics
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">Deep Analytics</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Visualize your progress, identify weak points, and track your consistency over time.
            </p>
          </div>
          {/* Card 3 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                view_list
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              view_list
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">DSA Sheets</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Integrated tracking for popular lists like Blind75, NeetCode 150, and Striver's SDE Sheet.
            </p>
          </div>
          {/* Card 4 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">Squad Tracking</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Create private leaderboards and hold your friends accountable in real-time.
            </p>
          </div>
          {/* Card 5 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                edit_note
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              edit_note
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">Integrated Notes</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Write markdown notes directly alongside problems for quick revision.
            </p>
          </div>
          {/* Card 6 */}
          <div className="glass-card rounded-premium p-8 glow-hover transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-neon-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_circle
              </span>
            </div>
            <span className="material-symbols-outlined text-neon-accent mb-6 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_circle
            </span>
            <h3 className="font-headline-md text-headline-md text-white mb-3">Video Solutions</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
              Quick access to curated video explanations for the toughest problems.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Dashboard Showcase */}
      <section className="py-section-padding bg-surface-container-lowest/50 relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-headline-lg text-white mb-4">A Workspace Built for Focus</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Experience a distraction-free, terminal-inspired environment designed specifically for engineering minds.
            </p>
          </div>
          <div className="glass-card rounded-[32px] p-2 shadow-2xl relative border-white/20 glow-hover">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[32px] pointer-events-none"></div>
            {/* Mockup Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-surface/50 rounded-t-[30px]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto flex gap-4">
                <span className="text-xs text-on-surface-variant bg-white/5 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">code</span> Editor View
                </span>
              </div>
            </div>
            {/* Mockup Body */}
            <div className="grid grid-cols-12 gap-px bg-white/5 rounded-b-[30px] overflow-hidden min-h-[600px]">
              {/* Sidebar */}
              <div className="col-span-12 md:col-span-2 bg-surface p-4 flex flex-col gap-6">
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3 font-semibold">Study Plan</div>
                  <ul className="space-y-2">
                    <li className="text-sm text-neon-accent flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">folder_open</span> NeetCode 150
                    </li>
                    <li className="text-sm text-on-surface-variant hover:text-white transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">folder</span> Blind 75
                    </li>
                    <li className="text-sm text-on-surface-variant hover:text-white transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">folder</span> Top Google
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3 font-semibold">Progress</div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">Arrays &amp; Hashing</span>
                        <span className="text-neon-accent">100%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-accent w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">Two Pointers</span>
                        <span className="text-neon-accent">85%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-accent w-[85%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">Sliding Window</span>
                        <span className="text-white/50">40%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/30 w-[40%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="col-span-12 md:col-span-7 bg-[#0A0A0A] p-6 flex flex-col relative">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-display font-semibold text-white">1. Two Sum</h3>
                    <div className="flex gap-2">
                      <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-mono">Easy</span>
                      <span className="bg-white/5 text-on-surface-variant px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">thumb_up</span> 42.5k
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-on-surface-variant mb-6 space-y-4">
                    <p>
                      Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                    </p>
                    <p>
                      You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
                    </p>
                  </div>
                  {/* Code Editor Mockup */}
                  <div className="flex-1 bg-[#131313] rounded-lg border border-white/10 flex flex-col overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex gap-4 text-xs font-mono text-on-surface-variant">
                      <button className="text-neon-accent">Solution.py</button>
                      <button className="hover:text-white">Tests.py</button>
                    </div>
                    <div className="p-4 font-code-snippet text-code-snippet text-white/80 leading-relaxed flex-1">
                      <pre>
                        <code>
                          <span className="text-blue-400">class</span> <span className="text-yellow-200">Solution</span>:<br />
                          {"    "}<span className="text-blue-400">def</span> <span className="text-yellow-200">twoSum</span>(self, nums: List[int], target: int) -&gt; List[int]:<br />
                          {"        "}prevMap = {} <span className="text-white/40"># val : index</span><br />
                          {"        "}<br />
                          {"        "}<span className="text-purple-400">for</span> i, n <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span>(nums):<br />
                          {"            "}diff = target - n<br />
                          {"            "}<span className="text-purple-400">if</span> diff <span className="text-purple-400">in</span> prevMap:<br />
                          {"                "}<span className="text-purple-400">return</span> [prevMap[diff], i]<br />
                          {"            "}prevMap[n] = i<br />
                          {"        "}<span className="text-purple-400">return</span> []
                        </code>
                      </pre>
                    </div>
                    <div className="bg-white/5 p-3 flex justify-between items-center border-t border-white/10">
                      <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> All tests passed
                      </span>
                      <button className="bg-neon-accent/20 text-neon-accent hover:bg-neon-accent hover:text-white transition-colors px-4 py-1.5 rounded text-xs font-semibold">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar / Activity */}
              <div className="col-span-12 md:col-span-3 bg-surface p-4 flex flex-col gap-6 border-l border-white/5">
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3 font-semibold flex justify-between items-center">
                    Activity <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <div className="text-xs text-on-surface-variant mb-1">Weekly Goal</div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-2xl font-display font-semibold text-white">12</span>
                      <span className="text-sm text-on-surface-variant pb-1">/ 15</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-accent to-primary w-[80%]"></div>
                    </div>
                  </div>
                  {/* Mini Chart Mockup */}
                  <div className="h-24 w-full flex items-end justify-between gap-1 mt-4 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="w-full bg-white/10 rounded-t h-[20%]"></div>
                    <div className="w-full bg-white/10 rounded-t h-[40%]"></div>
                    <div className="w-full bg-neon-accent/50 rounded-t h-[80%] relative">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon-accent rounded-full shadow-[0_0_10px_#ff6b00]"></div>
                    </div>
                    <div className="w-full bg-white/10 rounded-t h-[30%]"></div>
                    <div className="w-full bg-white/10 rounded-t h-[60%]"></div>
                    <div className="w-full bg-white/10 rounded-t h-[50%]"></div>
                    <div className="w-full bg-white/10 rounded-t h-[90%]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-on-surface-variant mt-2 font-mono">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Company Preparation */}
      <section className="py-section-padding max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-headline-lg text-white mb-4">Targeted Prep</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Focus your energy on the specific patterns and problems asked by your dream companies in the last 6 months.
            </p>
          </div>
          <Link to="/companies" className="text-neon-accent font-semibold flex items-center gap-2 hover:text-primary transition-colors">
            View All Companies <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Card 1 */}
          <Link to="/companies" className="glass-card rounded-2xl p-6 glow-hover group relative overflow-hidden border-t-2 border-t-[#4285F4] block">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4285F4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold font-display">G</div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded text-on-surface-variant font-mono">214 Probs</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Google</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Graphs</span><span className="text-white">35%</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>DP</span><span className="text-white">28%</span></div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1 text-on-surface-variant"><span>Your Progress</span><span className="text-neon-accent">12%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-neon-accent w-[12%]"></div></div>
              </div>
            </div>
          </Link>

          {/* Company Card 2 */}
          <Link to="/companies" className="glass-card rounded-2xl p-6 glow-hover group relative overflow-hidden border-t-2 border-t-[#FF9900] block">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF9900]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold font-display">A</div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded text-on-surface-variant font-mono">186 Probs</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Amazon</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Trees</span><span className="text-white">42%</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Arrays</span><span className="text-white">21%</span></div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1 text-on-surface-variant"><span>Your Progress</span><span className="text-white/50">0%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-neon-accent w-[0%]"></div></div>
              </div>
            </div>
          </Link>

          {/* Company Card 3 */}
          <Link to="/companies" className="glass-card rounded-2xl p-6 glow-hover group relative overflow-hidden border-t-2 border-t-[#0668E1] block">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0668E1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold font-display">M</div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded text-on-surface-variant font-mono">152 Probs</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Meta</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Strings</span><span className="text-white">38%</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Arrays</span><span className="text-white">31%</span></div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1 text-on-surface-variant"><span>Your Progress</span><span className="text-neon-accent">45%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-neon-accent w-[45%]"></div></div>
              </div>
            </div>
          </Link>

          {/* Company Card 4 */}
          <Link to="/companies" className="glass-card rounded-2xl p-6 glow-hover group relative overflow-hidden border-t-2 border-t-[#00A4EF] block">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00A4EF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold font-display">Ms</div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded text-on-surface-variant font-mono">134 Probs</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Microsoft</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Linked Lists</span><span className="text-white">25%</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Trees</span><span className="text-white">22%</span></div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1 text-on-surface-variant"><span>Your Progress</span><span className="text-neon-accent">8%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-neon-accent w-[8%]"></div></div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Coding Sheets */}
      <section className="py-section-padding bg-surface-container/30 border-y border-white/5">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-display text-headline-lg text-white mb-4">Legendary Playlists</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Track your progress through the most proven problem sets in the community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sheet 1 */}
            <div className="glass-card rounded-[28px] p-8 flex flex-col items-center text-center glow-hover">
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle class="text-white/10 stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeWidth="8"></circle>
                  <circle class="text-neon-accent stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeDasharray="283" strokeDashoffset="70" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-display font-bold text-white">112</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">/ 150</span>
                </div>
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-2">NeetCode 150</h3>
              <p className="text-sm text-on-surface-variant mb-6">The definitive list for modern technical interviews. Covers every pattern you need.</p>
              <Link to="/sheets" className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors font-semibold text-sm inline-block">
                Resume Sheet
              </Link>
            </div>
            {/* Sheet 2 */}
            <div className="glass-card rounded-[28px] p-8 flex flex-col items-center text-center glow-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon-accent/20 blur-[50px] rounded-full"></div>
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle class="text-white/10 stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeWidth="8"></circle>
                  <circle class="text-neon-accent stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeDasharray="283" strokeDashoffset="200" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-display font-bold text-white">22</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">/ 75</span>
                </div>
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-2">Blind 75</h3>
              <p className="text-sm text-on-surface-variant mb-6">The original curated list of high-ROI LeetCode problems.</p>
              <Link to="/sheets" className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors font-semibold text-sm inline-block">
                Resume Sheet
              </Link>
            </div>
            {/* Sheet 3 */}
            <div className="glass-card rounded-[28px] p-8 flex flex-col items-center text-center glow-hover">
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle class="text-white/10 stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeWidth="8"></circle>
                  <circle class="text-white/30 stroke-current" cx="50" cy="50" fill="transparent" r="45" strokeDasharray="283" strokeDashoffset="283" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-display font-bold text-white">0</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">/ 191</span>
                </div>
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-2">Striver's SDE</h3>
              <p className="text-sm text-on-surface-variant mb-6">Comprehensive sheet covering core DSA concepts for top product companies.</p>
              <Link to="/sheets" className="mt-auto w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-semibold text-sm inline-block">
                Start Sheet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Beautiful Analytics */}
      <section className="py-section-padding max-w-container-max mx-auto px-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-headline-lg text-white mb-6">Analytics that actually mean something.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Stop guessing where you stand. Our analytics engine breaks down your performance by pattern, difficulty, and company frequency to tell you exactly what to study next.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neon-accent/10 flex items-center justify-center flex-shrink-0 text-neon-accent">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Consistency Heatmap</h4>
                  <p className="text-sm text-on-surface-variant">Visualize your daily grind and build unbroken streaks of preparation.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neon-accent/10 flex items-center justify-center flex-shrink-0 text-neon-accent">
                  <span className="material-symbols-outlined">pie_chart</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Difficulty Distribution</h4>
                  <p className="text-sm text-on-surface-variant">Ensure you're pushing your limits, not just re-solving easy problems.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neon-accent/10 flex items-center justify-center flex-shrink-0 text-neon-accent">
                  <span className="material-symbols-outlined">radar</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Pattern Radar</h4>
                  <p className="text-sm text-on-surface-variant">Identify blind spots in your knowledge before the interviewer does.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="glass-card rounded-[32px] p-8 border-white/10 relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-accent/20 blur-[60px] rounded-full z-0"></div>
            <div className="relative z-10 flex flex-col gap-8">
              {/* Stat Row */}
              <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                  <div className="text-sm text-on-surface-variant mb-1">Problems Solved</div>
                  <div className="text-5xl font-display font-bold text-white">342</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-on-surface-variant mb-1">Global Rank</div>
                  <div className="text-2xl font-display font-semibold text-neon-accent">Top 4%</div>
                </div>
              </div>
              {/* Heatmap Mockup */}
              <div>
                <div className="text-sm text-white mb-3 font-semibold">Contributions</div>
                <div className="grid grid-cols-12 gap-1.5 opacity-80">
                  <div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/40 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/80 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div>
                  <div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/60 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/30 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/90 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div>
                  <div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/20 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/70 rounded-sm"></div><div className="w-full aspect-square bg-neon-accent/50 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div><div className="w-full aspect-square bg-white/10 rounded-sm"></div><div className="w-full aspect-square bg-white/5 rounded-sm"></div>
                </div>
              </div>
              {/* Difficulty Bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-green-400">Easy (120)</span>
                  <span className="text-yellow-400">Med (180)</span>
                  <span className="text-red-400">Hard (42)</span>
                </div>
                <div className="h-2 w-full flex rounded-full overflow-hidden">
                  <div className="h-full bg-green-500/80" style={{ width: '35%' }}></div>
                  <div className="h-full bg-yellow-500/80" style={{ width: '53%' }}></div>
                  <div className="h-full bg-red-500/80" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-surface text-center text-sm text-on-surface-variant">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-white text-lg">GrindFam</div>
          <p>© {new Date().getFullYear()} GrindFam. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/companies" className="hover:text-white transition-colors">Companies</Link>
            <Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
