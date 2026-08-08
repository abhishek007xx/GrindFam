import React from 'react';

export default function SquadIcon({ squad, isActive, onClick }) {
  const letter = (squad?.name || 'S')[0].toUpperCase();
  return (
    <div className="relative group flex items-center justify-center mb-2">
      <div className="absolute left-0 w-1 rounded-r-full bg-[#EA5D3A] transition-all duration-200"
        style={{ height: isActive ? '40px' : '0px', opacity: isActive ? 1 : 0 }} />
      <button
        onClick={onClick}
        className={`w-12 h-12 flex items-center justify-center text-base font-bold transition-all duration-300 ${
          isActive
            ? 'rounded-2xl bg-[#EA5D3A] text-white shadow-lg shadow-[#EA5D3A]/20'
            : 'rounded-[24px] bg-[#1E1E1E] border border-[#333333] text-zinc-300 hover:rounded-2xl hover:bg-[#EA5D3A] hover:text-white'
        }`}
      >
        {letter}
      </button>
      <div className="absolute left-16 bg-[#141414] border border-[#333333] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
        {squad?.name}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#141414] rotate-45" />
      </div>
    </div>
  );
}
