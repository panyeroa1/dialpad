import React from 'react';
import { Delete } from 'lucide-react';

interface DialPadProps {
  onDigitPress: (digit: string) => void;
  onDelete: () => void;
  onCall: () => void;
  disabled?: boolean;
}

const digits = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

export const DialPad: React.FC<DialPadProps> = ({ onDigitPress, onDelete, onCall, disabled }) => {
  return (
    <div className="w-full px-8 pb-8 flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {digits.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((digit) => (
              <button
                key={digit}
                onClick={() => onDigitPress(digit)}
                disabled={disabled}
                className="h-16 w-16 mx-auto rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-2xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-2">
        <div className="w-16"></div> {/* Spacer for alignment */}
        
        <button
          onClick={onCall}
          disabled={disabled}
          className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-900/50 disabled:opacity-50 transition-all transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>

        <button
          onClick={onDelete}
          disabled={disabled}
          className="h-16 w-16 flex items-center justify-center text-slate-400 hover:text-slate-200 active:text-slate-100 transition-colors disabled:opacity-50"
        >
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
};