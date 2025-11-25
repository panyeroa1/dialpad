import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4">
      <div className={`w-full max-w-md bg-slate-900 h-screen sm:h-[800px] sm:rounded-[2rem] sm:shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border border-slate-800 ${className}`}>
        {children}
      </div>
    </div>
  );
};