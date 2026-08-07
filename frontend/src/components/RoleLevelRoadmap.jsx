import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Briefcase, Award, CheckCircle2, ChevronRight,
  BookOpen, Code2, Cpu, Database, DollarSign, FileText, Layers, MessageSquare, ShieldCheck, Sparkles, Zap
} from 'lucide-react';

export default function RoleLevelRoadmap({ companyName = 'Company' }) {
  const [activeTab, setActiveTab] = useState('campus'); // 'intern', 'campus', 'senior'

  return (
    <div className="dash-card p-6 bg-[#1E1E1E] border border-[#333333] rounded-2xl shadow-xl">
      {/* Header & Role Level Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2C2C2C]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3" /> Role Level Roadmaps
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {companyName} Preparation Strategy by Role
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#333333]">
          <button
            onClick={() => setActiveTab('intern')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'intern'
                ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Intern Track</span>
          </button>

          <button
            onClick={() => setActiveTab('campus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'campus'
                ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Campus Placement (3-Mo)</span>
          </button>

          <button
            onClick={() => setActiveTab('senior')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'senior'
                ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Senior Level</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* 🎓 Intern Track */}
        {activeTab === 'intern' && (
          <motion.div
            key="intern"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent border border-emerald-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Internship Target Strategy
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Optimized for summer & winter engineering internships. Focuses heavily on speed in Online Assessments (OAs), core foundational DSA, and CS fundamentals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Module 1: OA Speed Drills */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" /> OA Speed Drills
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Time-boxed 60-min test simulation (2 problems).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Fast I/O & edge case handling techniques.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Master Arrays, Strings, Hashmaps & Two Pointers.</span>
                  </li>
                </ul>
              </div>

              {/* Module 2: CS Fundamentals */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                  <Cpu className="w-4 h-4" /> CS Fundamentals & Aptitude
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Operating Systems: Threads, Processes & Memory.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>DBMS: SQL Joins, Indexing & Normalization.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Computer Networks: TCP/IP, HTTP/HTTPS status codes.</span>
                  </li>
                </ul>
              </div>

              {/* Module 3: ATS Resume Checklist */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> ATS Resume & Projects
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Action verb + Quantified metric formula (`Built X achieving Y%`).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Highlight 2 Full-stack or Systems projects on GitHub.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Single-page clean ATS-friendly LaTeX template.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🚀 Campus Placement Track (3-Month Timeline) */}
        {activeTab === 'campus' && (
          <motion.div
            key="campus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#22c55e]/10 via-transparent to-transparent border border-[#22c55e]/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#22c55e]" />
                3-Month Campus Placement Sprint
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Structured 90-day roadmap designed for college placements. Covers foundational DSA, company OA patterns, and HR/Behavioral prep.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Month 1 */}
              <div className="p-4 rounded-xl bg-[#141414] border border-emerald-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase rounded-bl-lg">
                  Month 1
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Core DSA Foundations
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Arrays, Strings, Two Pointers & Sliding Window.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Stacks, Queues, Linked Lists & Recursion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Binary Trees, BSTs & Basic Traversals.</span>
                  </li>
                </ul>
              </div>

              {/* Month 2 */}
              <div className="p-4 rounded-xl bg-[#141414] border border-indigo-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-bold text-[9px] uppercase rounded-bl-lg">
                  Month 2
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <Code2 className="w-4 h-4 text-indigo-400" /> OA Patterns & Top 50
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Dynamic Programming (1D, 2D & Knapsack patterns).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Graph Traversals (BFS, DFS, Dijkstra, Topo Sort).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{companyName} Top 50 Most Frequent Questions.</span>
                  </li>
                </ul>
              </div>

              {/* Month 3 */}
              <div className="p-4 rounded-xl bg-[#141414] border border-amber-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/20 text-amber-400 font-bold text-[9px] uppercase rounded-bl-lg">
                  Month 3
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> Mock OAs & HR Prep
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Full 90-minute Mock Online Assessment tests.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>STAR Method for HR & Behavioral questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>`Tell me about yourself` & Project deep-dive prep.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* 💼 Senior Level Track */}
        {activeTab === 'senior' && (
          <motion.div
            key="senior"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-transparent border border-purple-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                Senior / Lateral Hiring Strategy
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">
                For experienced software engineers (SDE-2, SDE-3, Tech Leads). Combines advanced DSA with High-Level & Low-Level System Design, leadership principles, and salary negotiation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Module 1: System Design (HLD & LLD) */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                  <Database className="w-4 h-4" /> System Design (HLD & LLD)
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>HLD: Scalability, Caching (Redis), Load Balancers, DB Sharding.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>LLD: Object-Oriented Design & Design Patterns (Observer, Factory).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Design Uber, Rate Limiter, URL Shortener & Messenger.</span>
                  </li>
                </ul>
              </div>

              {/* Module 2: Leadership Principles */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Leadership & Behavioral
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Company Leadership Principles (e.g. Amazon 16 LPs, Google Googliness).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>STAR Stories: Technical conflicts, Trade-offs & Deadlines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Cross-team alignment & Mentorship examples.</span>
                  </li>
                </ul>
              </div>

              {/* Module 3: Negotiation & Compensation */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" /> Salary & Offer Negotiation
                </div>
                <ul className="text-xs text-[#A3A3A3] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Base Salary vs RSUs/Equity vs Joining Bonus breakdown.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Leveraging competing offers & market benchmarks (Levels.fyi).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Counter-offer email scripts & recruiter call scripts.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
