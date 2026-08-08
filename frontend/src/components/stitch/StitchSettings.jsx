import React, { useState, useEffect } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function StitchSettings() {
  const { session } = useAuth();
  const { activeSquad, updateSquadSettings } = useSquadStore();
  
  const [squadName, setSquadName] = useState('');
  const [squadGoal, setSquadGoal] = useState('');
  const [squadType, setSquadType] = useState('private');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeSquad) {
      setSquadName(activeSquad.name || '');
      setSquadGoal(activeSquad.goal || '');
      setSquadType(activeSquad.squad_type || 'private');
    }
  }, [activeSquad]);

  const handleSave = async () => {
    if (!activeSquad?.id) return;
    setIsSaving(true);
    try {
      await updateSquadSettings(activeSquad.id, {
        name: squadName,
        goal: squadGoal,
        squad_type: squadType
      });
      // Optionally show a toast here
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-8 pb-12 max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row gap-8 font-['Inter'] antialiased w-full px-4 md:px-8">
      {/* Settings Inner Sidebar */}
      <aside className="w-full md:w-[240px] flex-shrink-0">
        <h1 className="font-['Outfit'] text-3xl font-bold text-[#e5e2e1] mb-6">Settings</h1>
        <nav className="flex flex-col gap-2">
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Account
          </button>
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Privacy
          </button>
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 font-medium transition-colors">
            Squad Preferences
          </button>
        </nav>
      </aside>

      {/* Settings Content Form */}
      <div className="flex-1 max-w-3xl glass-panel bg-[rgba(30,30,30,0.6)] rounded-xl p-6 md:p-8 space-y-8 border border-[rgba(51,51,51,0.6)]">
        {/* Section: Basic Info Form */}
        <div className="space-y-6">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Squad Preferences</h2>
          
          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Squad Name</label>
            <input 
              value={squadName} onChange={(e) => setSquadName(e.target.value)}
              className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all" 
              type="text" 
            />
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Squad Type</label>
            <div className="relative">
              <select 
                value={squadType} onChange={(e) => setSquadType(e.target.value)}
                className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all appearance-none"
              >
                <option value="private">Private (Invite Only)</option>
                <option value="public">Public</option>
                <option value="community">Community Tier</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#e1bfb7] pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Primary Goal</label>
            <textarea 
              value={squadGoal} onChange={(e) => setSquadGoal(e.target.value)}
              className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all resize-y" 
              rows={3} 
              placeholder="e.g., Grinding LeetCode for FAANG interviews"
            ></textarea>
          </div>
        </div>

        <hr className="border-[#59413b]/30"/>

        {/* Section: Danger Zone */}
        <div className="space-y-6">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#EF4444]">Danger Zone</h2>
          <div className="flex items-center justify-between py-2 border-b border-[#59413b]/20">
            <div>
              <div className="font-['Inter'] text-lg text-[#e5e2e1]">Leave Squad</div>
              <div className="font-['Inter'] text-sm text-[#e1bfb7]">You will lose access to the squad's private resources.</div>
            </div>
            <button className="bg-transparent border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 px-4 py-2 rounded-md font-['JetBrains_Mono'] text-sm transition-colors">
              Leave Squad
            </button>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave} disabled={isSaving}
            className="bg-[#f2633f] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(242,99,63,0.3)] hover:brightness-110 transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
