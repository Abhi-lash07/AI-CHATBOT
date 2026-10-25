import React from 'react';
import { useChat } from '../../context/ChatContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function Toast() {
  const { toast } = useChat();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#818CF8] shrink-0" />,
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-white dark:bg-[#151C2C] text-emerald-800 dark:text-emerald-300 shadow-emerald-500/10',
    error: 'border-rose-500/30 bg-white dark:bg-[#151C2C] text-rose-800 dark:text-rose-300 shadow-rose-500/10',
    info: 'border-[#818CF8]/30 bg-white dark:bg-[#151C2C] text-[#111827] dark:text-[#F3F4F6] shadow-indigo-500/10',
  };

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md text-sm font-medium transition-all ${
          bgStyles[toast.type] || bgStyles.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
