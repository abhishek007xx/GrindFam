import React, { useState } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function StitchSquadRepo() {
  const { session } = useAuth();
  const { activeSquad, snippets, shareSnippet } = useSquadStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('javascript');
  const [newCode, setNewCode] = useState('');

  const filteredSnippets = snippets.filter(s => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    try {
      await shareSnippet({
        squadId: activeSquad.id,
        title: newTitle,
        language: newLanguage,
        code: newCode
      });
      setIsUploading(false);
      setNewTitle('');
      setNewCode('');
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Hard') return 'border-l-[#ffb4ab]';
    if (diff === 'Medium') return 'border-l-[#f2633f]';
    return 'border-l-[#10B981]';
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen p-4 md:p-8 flex flex-col gap-8 font-['Inter'] antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1] mb-2">Repository</h1>
          <p className="font-['Inter'] text-lg text-[#e1bfb7]">Shared knowledge base and algorithmic patterns for the squad.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb7]">search</span>
            <input 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#353534] border border-[#59413b] rounded-full py-2 pl-10 pr-4 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6] transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
              placeholder="Search Repository..." type="text"
            />
          </div>
          <button 
            onClick={() => setIsUploading(!isUploading)}
            className="bg-[#EA5D3A] text-white flex items-center gap-2 px-6 py-2 rounded-lg font-['Outfit'] text-xl font-bold hover:brightness-110 hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all"
          >
            <span className="material-symbols-outlined">{isUploading ? 'close' : 'upload'}</span>
            <span className="hidden sm:inline">{isUploading ? 'Cancel' : 'Upload Code'}</span>
          </button>
        </div>
      </div>

      {isUploading ? (
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl border border-[rgba(89,65,59,0.3)] w-full max-w-2xl">
          <h2 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] mb-6">Upload Snippet</h2>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-[#e1bfb7] mb-1">Snippet Title</label>
              <input 
                type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required
                className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
                placeholder="e.g. Optimized Segment Tree"
              />
            </div>
            <div>
              <label className="block text-sm text-[#e1bfb7] mb-1">Language</label>
              <select 
                value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#e1bfb7] mb-1">Code</label>
              <textarea 
                value={newCode} onChange={(e) => setNewCode(e.target.value)} required
                className="w-full h-48 bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] font-['JetBrains_Mono'] focus:outline-none focus:border-[#4cd7f6] resize-none"
                placeholder="Paste code here..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-[#4cd7f6] text-[#0D0D0D] px-6 py-2 rounded font-bold hover:brightness-110 transition-all">
                Save Snippet
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7]">
            <span className="material-symbols-outlined text-[#EA5D3A]">folder</span>
            <span>Squad_Root</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#e5e2e1]">All Snippets</span>
          </div>

          {/* Repository Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSnippets.length === 0 && (
              <p className="text-[#e1bfb7] col-span-full">No snippets found in this squad yet.</p>
            )}
            
            {filteredSnippets.map((snippet) => (
              <div key={snippet.id} className={`glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)] border-l-4 ${getDifficultyColor(snippet.difficulty || 'Medium')}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-[#e1bfb7]">description</span>
                    <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">{snippet.title}</h3>
                  </div>
                  <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
                    <span className="material-symbols-outlined">star</span>
                  </button>
                </div>
                <div className="bg-[#131313] p-2 rounded overflow-hidden max-h-16 font-['JetBrains_Mono'] text-[10px] text-[#A3A3A3]">
                  <code>{snippet.code.slice(0, 100)}...</code>
                </div>
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-[#59413b] bg-[#353534] flex items-center justify-center text-xs font-bold text-white">
                      {(snippet.author_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-['Inter'] text-sm text-[#e1bfb7]">by {snippet.author_name}</span>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">
                    {new Date(snippet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
