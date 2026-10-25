import React from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Sparkles,
  X,
  Code2,
  Palette,
  Shield,
  Layers,
  Cpu,
  CheckCircle,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

export function AboutModal() {
  const { activeModal, closeModal } = useChat();

  if (activeModal !== 'about') return null;

  const techStack = [
    { name: 'React 18', role: 'Component UI & State Framework', color: 'text-cyan-500' },
    { name: 'Tailwind CSS', role: 'Modern Gemini-inspired Styling & Dark Mode', color: 'text-sky-500' },
    { name: 'Lucide React', role: 'Accessible Vector Iconography', color: 'text-purple-500' },
    { name: 'Google Gemini API', role: 'Multimodal LLM Integration (1.5 Flash / Pro)', color: 'text-blue-500' },
    { name: 'Local Storage', role: 'Persistent Chat History & Offline Cache', color: 'text-emerald-500' },
    { name: 'Vite 5', role: 'Lightning-fast Modern Frontend Tooling', color: 'text-amber-500' },
  ];

  const highlights = [
    '✨ Gemini-inspired clean aesthetics with responsive Light & Dark themes',
    '💬 Multi-turn conversation management with search, rename & delete',
    '⚡ Realistic typing simulation in Demo Mode & live streaming via Gemini API',
    '💻 Full Markdown parsing with syntax-highlighted code blocks & one-click copy',
    '🔒 Zero API key exposure — keys are strictly stored on the client machine',
    '📱 100% Mobile & tablet responsive with slide-over drawer navigation',
    '🎙️ Speech-to-text voice input support via browser Web Speech API',
    '📎 File & image attachment preview interfaces'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#293247] rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] p-[1.5px]">
              <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#818CF8]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] leading-tight">
                About ChatBot AI
              </h2>
              <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Powered by Google Gemini</span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* Project College Showcase Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                College UI/UX Design & Full-Stack Development Project
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                ChatBot AI was engineered to demonstrate professional human-computer interaction (HCI), minimal cognitive load, responsive layout engineering, and robust client-side state persistence inspired by Google Gemini.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Project Description
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              ChatBot AI is a sleek web application that offers conversational artificial intelligence with fluid micro-interactions, dark/light theme switching, full chat session persistence, and customizable API connectivity. It features a standalone <strong>Demo Mode</strong> with rich simulated streaming responses across coding, creative writing, science, and ideation, as well as live connection capability to <strong>Google's Gemini 1.5 & 2.0</strong> models.
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Technologies Used
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {techStack.map((tech, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-2.5"
                >
                  <Code2 className={`w-4 h-4 mt-0.5 shrink-0 ${tech.color}`} />
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {tech.name}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-400">
                      {tech.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Key Features & Architectural Highlights
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#293247] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0B1020]/60">
          <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Version 1.0.0 • Production Ready</span>
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white shadow-md shadow-indigo-500/25 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
